import {HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHandler,
    HttpInterceptor, HttpParams, HttpRequest, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {CookieService} from "ngx-cookie-service";
import {App, NavController} from "ionic-angular";
import {AuthPage} from "../../pages/auth/auth";
import {HomePage} from "../../pages/home/home";
import "rxjs/add/operator/catch";
import {Device} from "@ionic-native/device";
import { tap } from 'rxjs/operators';
import {CacheService} from "../cacheService/cacheProvider";
import {of} from "rxjs/observable/of";

@Injectable()

export class MyHttpInterceptorProvider implements HttpInterceptor {
    userRequest: any;
    cookieValue: any;
    deviceId: string;
    constructor(public http: HttpClient,
                public cookieService: CookieService,
                protected app: App,
                public device: Device,
                private cacheService: CacheService
    ) {
    }
    navCtrl(): NavController {
        return this.app.getRootNav();
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<HttpEventType.User>> {
        if (req.url.includes('/login')) {
            return next.handle(req);
        }
        this.userRequest = req;
        this.cookieValue = localStorage.getItem('forCookieValue');
        this.deviceId = localStorage.getItem('deviceId');
        const cachedResponse = this.cacheService.get(req);
        if (cachedResponse) {
            return of(cachedResponse);
        }
        if (this.cookieValue) {
            try {
                const userCookieJson = JSON.parse(this.cookieValue);
                this.userRequest = req.clone({
                    params: new HttpParams({
                        fromObject: {
                            'username': userCookieJson.login,
                            'password'  : userCookieJson.token
                        }
                    }),
                });
            } catch (e) {
                console.error('Could not parse cookie: ' + this.cookieService, e);
            }
        }
        else if(this.deviceId) {
            try {
                const deviceId = localStorage.getItem('deviceId');
                this.userRequest = req.clone({
                    params: new HttpParams({
                        fromObject: {
                            'anonymousUserId': deviceId,
                        }
                    }),
                });
            } catch (e) {
                console.error('Could not parse device id: ' + this.deviceId, e);
            }
        }
        return next.handle(this.userRequest).pipe(tap(res =>{
            if (res instanceof HttpResponse) {
                if (this.isRequestCachable(req)){
                    this.cacheService.put(req, res);
                }
            }
        })).catch((error, caught) => {
            console.log('error', error);
            if (error instanceof HttpErrorResponse) {
                let navController = this.navCtrl();
                if (error.status === 401) {
                    navController.setRoot(AuthPage);
                    return Observable.of(HttpEventType.User);
                }
                else {
                    navController.setRoot(HomePage);
                }
            }
            return Observable.of(HttpEventType.User);
        })  as any;
    }
    private isRequestCachable(req: HttpRequest<any>) {
        return (req.method === 'GET' || 'PUT' || 'POST' || 'DELETE' ) && (req.url.includes('/articles') ||
            (req.url.includes('/article') && !req.url.includes('/like')));
    }
}
import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Events, Nav, Platform, ToastController} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";

import {HomePage} from "../pages/home/home";
import {ListPage} from "../pages/list/list";
import {ArticlePage} from "../pages/article/article";

import {CategoryProvider} from "../providers/category/category";
import {AdminPage} from "../pages/admin/admin";
import {CookieService} from "ngx-cookie-service";
import {Subscription} from "rxjs/Subscription";

import {AuthPage} from "../pages/auth/auth";
import {Push, PushObject, PushOptions} from '@ionic-native/push';
import {LocalConnectionServiceProvider} from "../providers/local-connection-service/local-connection-service";
import {LocalNotifications} from '@ionic-native/local-notifications';
import {FCM} from "@ionic-native/fcm";
import {Categories} from "../classes/localstorage";

@Component({
    templateUrl: 'app.html'
})
export class MyApp implements OnInit, OnDestroy {
    @ViewChild(Nav) nav: Nav;

    categories: Categories[];                    // все категории
    users: string[];                         // список ролей у пользователя
    cookieValue: string;                   // полученные куки
    sub: Subscription;                  // подписка на получение категори
    enter: string;                         // прослушиваемое
    enteredDay: number;                    // день входа в приложение
    user_name: string;
    count: number;


    pages: Array<{ title: string, component: any }>;

    constructor(public platform: Platform,
                public statusBar: StatusBar,
                public splashScreen: SplashScreen,
                public categoryProvider: CategoryProvider,
                public cookieService: CookieService,
                public events: Events,
                public socketService: LocalConnectionServiceProvider,
                private push: Push,
                private fcm: FCM,
                private toastCtrl: ToastController,
                private localNotifications: LocalNotifications) {
        this.pages = [
            {title: 'Home', component: HomePage},
            {title: 'List', component: ListPage},
            {title: 'Article', component: ArticlePage}
        ];
        this.events.subscribe('refresh-user-roles', (componentName) => {
            this.cookieValue = localStorage.getItem('forCookieValue');
            const userCookieJson = JSON.parse(this.cookieValue);
            if (userCookieJson) {
                this.users = userCookieJson.roles;
            }
            this.sub = this.categoryProvider
                .findAllCategories()
                .subscribe((data: Categories[]) => {
                    this.categories = data;
                }, err => {
                    console.error(err);
                });
        })
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.statusBar.overlaysWebView(false);
            this.splashScreen.hide();

        });
        if (!localStorage.getItem('deviceId')) {

            this.categoryProvider.getMac().subscribe(mac => {
                localStorage.setItem('deviceId', mac._id);
            });
        }


        if (this.cookieValue) {
            const userCookieJson = JSON.parse(this.cookieValue);
            this.enteredDay = JSON.parse(localStorage.getItem('createdDay'));
            this.users = userCookieJson.roles;
            const lifeTimeLocalStorage = userCookieJson.cookieLifeTime * 24 * 60 * 60 * 1000;
            const today = new Date().getTime();

            if (today >= (this.enteredDay + lifeTimeLocalStorage)) {
                localStorage.removeItem('forCookieValue');
                localStorage.removeItem('createdDay');
            }

            this.socketService.init(userCookieJson);
            if (this.platform.is('core') || this.platform.is('mobileweb')) {
                console.log('I am on a web browser - FCM disabled!')
            } else {
                console.log('I am on a emulator - FCM enabled');
                this.pushSetup();
            }


        }
        this.nav.push(HomePage);
    }

    // scheduleNotification(text) {
    //     this.localNotifications.schedule({
    //         // title: 'huukbhkbuhbhubjhbjvbhvb',
    //         text: text,
    //     });
    // }

    // Не показывать кнопку "Админ" для читателя
    canShow(): boolean {
        if (this.users) {
            if (this.users.filter((x) => (x === "CN=NEWS_publisher" || x === "CN=NEWS_Administrator" || x === "CN=NEWS_Editor" || x === "CN=NEWS_Author")).length > 0) {
                return true;
            }
        } else {
            return false;
        }
    };

    signIn() {
        this.nav.setRoot(AuthPage)
    }

    pushSetup() {
        const userCookieJson = JSON.parse(this.cookieValue);
        const login = userCookieJson.login;
        //Notifications
        this.fcm.subscribeToTopic(login);
        this.fcm.getToken().then(token => {
            console.log(token);
        });
        this.fcm.onNotification().subscribe(data => {
            if (data.wasTapped) {
                console.log("Received in background", data);
            } else {
                console.log("Received in foreground", data);
                let word: string = data.score;
                let toast = this.toastCtrl.create({
                    duration: 3000,
                    message: word
                });
                toast.present();
                this.localNotifications.schedule({
                    id: 1,
                    text: 'Single ILocalNotification',
                    // sound: isAndroid? 'file://sound.mp3': 'file://beep.caf',
                    // data: { secret: key }
                });
            }
            ;
        });
        this.fcm.onTokenRefresh().subscribe(token => {
            console.log(token);
        });
        //end notifications.

        const options: PushOptions = {
            android: {
                senderID: '1045103819568'
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'true'
            }
        };

        const pushObject: PushObject = this.push.init(options);


        pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));

        pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));

        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
    }

    // открытие хом страници при загрузки приложения
    openPage() {
        this.nav.setRoot(HomePage, {
            filterForSwipe: "allArticles"
        });
    }

    // фильтрация по категории
    openHomePage(category) {
        this.nav.setRoot(HomePage, {
            category_id: category._id,
            filterForSwipe: "byCategory"
        });
    }

    // открытие всех статей
    openAllArticles() {
        this.nav.setRoot(HomePage, {
            filterForSwipe: "allArticles"
        });
    }

    // открытие админки
    openAdmin() {
        this.nav.setRoot(AdminPage);
    }

    // выход
    logOut() {
        const userCookieJson = JSON.parse(this.cookieValue);
        const login = userCookieJson.login;
        this.fcm.unsubscribeFromTopic(login);

        localStorage.removeItem('forCookieValue');
        localStorage.removeItem('createdDay');
        this.nav.setRoot(HomePage);
        this.socketService.breakConnect();
        this.users = null;
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
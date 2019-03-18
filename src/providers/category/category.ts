import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {conf} from "../../app/enviroment";
import {DeviceId} from "../../classes/localstorage";
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import {Categories} from "../../classes/localstorage";

@Injectable()
export class CategoryProvider {

    constructor(public http: HttpClient) {

    }

    apiUrl = conf.host + conf.port;



    findAllCategories() {
        return this.http.get(`${this.apiUrl}/categories`);
    }

    getCategories() {
        return this.http.get(`${this.apiUrl}/categories`);
    }

    addNewOneCategory(name: any) {
        return this.http.post(`${this.apiUrl}/category`, name);
    }

    deleteOneCategory(IdCategory) {
        return this.http.delete(`${this.apiUrl}/category/${IdCategory}`);
    }
    getMac(): Observable <DeviceId> {
        return this.http.post <DeviceId> (`${this.apiUrl}/anonymousUserId`, {}, {}).pipe(map((mac) => {
            return mac;
        }));


    }
    sortCategories(categories): Observable <Categories[]> {
        return this.http.put <Categories[]> (`${this.apiUrl}/categoriesByOrder`, {"order": categories}, {})
    }
}

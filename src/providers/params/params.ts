import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {conf} from "../../app/enviroment";

@Injectable()
export class ParamsProvider {

    apiUrl = conf.host + conf.port;

    constructor(public http: HttpClient) {

    }
    // единажды устанавливаем базовые параметры
    setParams(template) {
        return this.http.post(`${this.apiUrl}/template`, template);
    }

    getParams() {
        return this.http.get(`${this.apiUrl}/templates`);
    }

    changeParams(template) {
        return this.http.put(`${this.apiUrl}/template/${template._id}`, template);
    }

}

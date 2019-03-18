import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {conf} from "../../app/enviroment";

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {

    constructor(public http: HttpClient) {

    }

    apiUrl = conf.host + conf.port;

    findAllArticles() {
        let headers = new HttpHeaders({'Pragma-directive': 'no-cache'});
        headers = headers.append('Cache-control', 'no-cache');
        headers = headers.append('Cache-control', 'max-age=3600, must-revalidate');
        return new Promise(resolve => {
            this.http.get(this.apiUrl+'/articles', {headers}).subscribe(data => {
                resolve(data);
            }, err => {
                console.log(err);
            });
        });
    }

    findArticleById(id: string) {
        const confirmation = true;
        return new Promise(resolve => {
            this.http.get(this.apiUrl+`/article/${id}/${confirmation}`).subscribe(data => {
                resolve(data);
            }, err => {
                console.log(err);
            });
        });
    }

    findAllArticlesByCategory(category: string, count: number) {
        return new Promise(resolve => {
            this.http.get(this.apiUrl+`/articles/category/${category}/${true}/${count}`).subscribe(data => {
                resolve(data);
            }, err => {
                console.log(err);
            })
        });
    }

    findAllArticlesByConfirmation(confirmation: string, count: number) {
        return new Promise(resolve => {
            this.http.get(`${this.apiUrl}/articles/confirmation/${confirmation}/${count}`)
                .subscribe(data => {
                    resolve(data);
                }, err => {
                    console.log(err);
                })
        });
    }

    likeArticle(id : string) {
        return new Promise(resolve => {
            this.http.put(this.apiUrl+`/article/like/${id}`, {})
                .subscribe(data => {
                    resolve(data);
                }, err => {
                    console.log(err);
                });
        });
    }
}
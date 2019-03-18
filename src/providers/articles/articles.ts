import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {conf} from "../../app/enviroment";
import {Constants} from "../../classes/constants";
import {ToastController} from "ionic-angular";

@Injectable()
export class ArticlesProvider {

    api =  conf.host + conf.port;


    constructor(public http: HttpClient, private toastController: ToastController) { }

    getAllArticles(count): Observable<any> {
        return this.http.get(`${this.api}/articles/${count}`);
    }

    getOneArticleById(id, confirmation) {
        // let headers = new HttpHeaders({'Pragma-directive': 'no-cache'});
        // headers = headers.append('Cache-directive', 'no-cache');
        // headers = headers.append('Cache-control', 'no-cache');
        // headers = headers.append('Pragma', 'no-cache');
        // headers = headers.append('Expires', '0');

        return this.http.get(`${this.api}/article/${id}/${confirmation}`);
    }

    getAllArticlesByCOnfirmation(count) {
        let headers = new HttpHeaders({'Pragma-directive': 'no-cache'});
        headers = headers.append('Cache-control', 'no-cache');
        headers = headers.append('Cache-control', 'max-age=3600, must-revalidate');
        const confirmation = true;
        return this.http.get(`${this.api}/articles/confirmation/${confirmation}/${count}`, {headers})
    }

    findAllArticlesByCategoryAndConfirmation(idCategory, count) {
        const confirmation = true;
        return this.http.get(`${this.api}/articles/category/${idCategory}/${confirmation}/${count}`)
    }

    deleteOneArticle(article): Observable<any> {
        return this.http.delete(`${this.api}/article/${article._id}`);
    }

    publicateOneArticle(article) {
        return this.http.put(`${this.api}/article/${article._id}`, article);
    }

    getParams() {
        return this.http.get(`${this.api}/templates`);
    }

    addOneNews(categoryId, news: any, templateId, userId) {
        if (news && news.video) {

            let formData = new FormData();
            formData.append('video', news.video);
            formData.append('title', news.title);
            formData.append('body', news.body);
            formData.append('shortBody', news.shortBody);
            formData.append('status', news.status);
            formData.append('confirmation', news.confirmation);

            return this.http.post(`${this.api}/article/${categoryId}/${templateId}/${userId}`, formData);
        }
        return this.http.post(`${this.api}/article/${categoryId}/${templateId}/${userId}`, news);
    }

    changeArticle(article) {
        return this.http.put(`${this.api}/article/${article._id}`, article);
    }

    changeOneArticle(article, categoryId) {
        return this.http.put(`${this.api}/article/${article._id}/${categoryId}`, article);
    }

    enterInAdmin(user) {
        return this.http.post(`${this.api}/login`, user, {headers: {'Content-type': 'application/json'}, withCredentials: true});
    }

    findAllArticlesByUserId(id, count) {
        return this.http.get(`${this.api}/articles/user/${id}/${count}`);
    }

    findAllArticlesByCreated(count) {
        return this.http.get(`${this.api}/articles/status_created/${count}`);
    }

    findAllArticlesByModified(count) {
        return this.http.get(`${this.api}/articles/status_modified/${count}`);
    }
    public downloadReport(from, to): Observable <HttpResponse<object>> {
        let headers = {
            headers: new HttpHeaders({
                'Accept':'application/csv'
            }),
            observe: 'response' as 'body',
            responseType: 'blob' as 'json'
        };

        return this.http.get<HttpResponse<object>>(`${this.api}/report/${from}/${to}`, headers)
    }
    public async presentToastWithOptions(condition: string) {
        const text_message =
            (condition === 'report') ? Object.assign(Constants.toastMessageOptions, Constants.toastMessageText.absenceReport):
            (condition === 'add') ? Object.assign(Constants.toastMessageOptions, Constants.toastMessageText.addingArticle):
                (condition === 'del') ? Object.assign(Constants.toastMessageOptions, Constants.toastMessageText.deletingArticle):
                    (condition === 'edit') ?  Object.assign(Constants.toastMessageOptions, Constants.toastMessageText.editingArticle):
                        Object.assign(Constants.toastMessageOptions, {message: condition});

        const toast = await this.toastController.create(text_message);
        toast.present();
    }

}

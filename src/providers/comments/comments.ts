import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import {conf} from "../../app/enviroment";

@Injectable()
export class CommentsProvider {

    api   = conf.host + conf.port;


    constructor(public http: HttpClient) { }

    getAllComments(count): Observable<any> {
        return this.http.get(`${this.api}/comments/${count}`);
    }

    getAllCommentsForUser(count): Observable<any> {
        return this.http.get(`${this.api}/comments_by_auth/${count}`);
    }

    deleteOneComment(comment): Observable<any> {
        return this.http.delete(`${this.api}/comment/${comment._id}`);
    }

    changeStatusComent(comment) {
        return this.http.put(`${this.api}/comment/${comment._id}`, comment);
    }

    // addOneComment(comment: any) {
    //         // let headers = new HttpHeaders({'content-type': 'multipart/form-data; boundary=' + news.video.size});
    //         // headers = headers.append('content-Disposition', `form-data; name=\"${news.video.name}\"`);
    //         // headers.append({'content-type':'multipart/form-data'});
    //         let formData = new FormData();
    //         formData.append('body', comment.body);
    //         formData.append('confirmation', comment.confirmation);
    //
    //         return this.http.post(`${this.api}/comment`, formData);
    // }

    addOneComment(idArticle, idUser, comment) {
        return this.http.post(`${this.api}/comment/${idArticle}/${idUser}`, comment);
    }
}

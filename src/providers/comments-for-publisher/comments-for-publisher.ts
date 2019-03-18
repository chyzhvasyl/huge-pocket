import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {conf} from "../../app/enviroment";

@Injectable()
export class CommentsForPublisherProvider {

    api   = conf.host + conf.port;


    constructor(public http: HttpClient) { }

    addCommentByPublisher(idArticle, userById, comment) {
        return this.http.post(`${this.api}/commentByPublisher/${idArticle}/${userById}`, comment);
    }
}

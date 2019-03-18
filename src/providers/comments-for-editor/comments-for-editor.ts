import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {conf} from "../../app/enviroment";

@Injectable()
export class CommentsForEditorProvider {

    api   = conf.host + conf.port;


    constructor(public http: HttpClient) { }

    addCommentByEditor(idArticle, idUser, comment) {
        return this.http.post(`${this.api}/commentByEditor/${idArticle}/${idUser}`, comment);
    }

}

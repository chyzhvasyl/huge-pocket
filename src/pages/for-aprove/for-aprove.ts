import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {ArticlesProvider} from "../../providers/articles/articles";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CookieService} from "ngx-cookie-service";
import {CommentsForPublisherProvider} from "../../providers/comments-for-publisher/comments-for-publisher";
import {CommentsForEditorProvider} from "../../providers/comments-for-editor/comments-for-editor";

@IonicPage()
@Component({
    selector: 'page-for-aprove',
    templateUrl: 'for-aprove.html',
})
export class ForAprovePage {

    id: string;                     // id статьи
    sub1: Subscription;             // подписка на получение статьи
    article: any;                   // статья
    form: FormGroup;                // форма для сообщения
    commetAprove: any;              // комментарий
    confirm: boolean;               // для передачи confirmation самой статьи в запросе
    users: any;                     // список ролей пользователя
    cookieValue: any;               // значение куков
    userById: any;                  // id пользователя

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public articlesProvider: ArticlesProvider,
                public commentForPublisher: CommentsForPublisherProvider,
                public commentForEditor: CommentsForEditorProvider,
                public cookieService: CookieService) {

        this.form = new FormGroup({
            comment: new FormControl('', Validators.required)
        });

        this.id = navParams.get('id');
        this.confirm = navParams.get('confirm');
    }

    ionViewWillEnter() {
        this.cookieValue = localStorage.getItem('forCookieValue');
        const userCookieJson = JSON.parse(this.cookieValue);
        this.users = userCookieJson.roles;
        this.userById = userCookieJson._id;

        this.sub1 = this.articlesProvider
            .getOneArticleById(this.id, this.confirm)
            .subscribe((res) => {
                if (Array.isArray(res)) {
                    this.article = res[0];
                } else {
                    this.article = res;
                }
            }, (err) => {
                console.error(err);
            })
    }

    // возврат ко всем статьям
    backForArticles() {
        this.navCtrl.pop();
    }

    // отправка комментария
    sendCommentForAprove() {
        this.users.forEach((x)  => {

            // запрос всех статей для админа
            if (x === 'CN=NEWS_Editor') {
                this.commetAprove = {
                    'body': this.form.value.comment
                };

                this.commentForEditor
                    .addCommentByEditor(this.article._id, this.userById, this.commetAprove)
                    .subscribe((res) => {
                        this.navCtrl.pop();
                    }, (err) => {
                        console.error(err);
                    });

                const changeStatus = {
                    '_id': this.article._id,
                    'status': 'not approved by editor'
                };

                this.articlesProvider
                    .changeArticle(changeStatus)
                    .subscribe((res) => {

                    }, (err) => {
                        console.error(err);
                    });

            } else if (x === 'CN=NEWS_publisher') {
                this.commetAprove = {
                    'body': this.form.value.comment
                };

                this.commentForPublisher
                    .addCommentByPublisher(this.article._id, this.userById, this.commetAprove)
                    .subscribe((res) => {
                        this.navCtrl.pop();
                    }, (err) => {
                        console.error(err);
                    });

                const changeStatus = {
                    '_id': this.article._id,
                    'status': 'not approved by publisher'
                };

                this.articlesProvider
                    .changeArticle(changeStatus)
                    .subscribe((res) => {

                    }, (err) => {
                        console.error(err);
                    });
            }
        });

    }

    ionViewWillUnload() {
        this.sub1.unsubscribe();
    }


}

import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";
import {CookieService} from "ngx-cookie-service";
import {ArticlesProvider} from "../../providers/articles/articles";
import {Subscription} from "rxjs/Subscription";

@IonicPage()
@Component({
    selector: 'page-message-pub-and-editor',
    templateUrl: 'message-pub-and-editor.html',
})
export class MessagePubAndEditorPage {

    users: any;                         // роли пользователя
    cookieValue: any;                   // значение куков
    confirm: boolean;                   // для передачи в запросе confirmayion  самой статьи
    id: string;                         // id статьи
    article: any;                       // статья
    sub1: Subscription;                 // подписка на получение статьи
    commentForAuthor: string;           // комментраий для автора
    commentForEditor: string;           // комментраий для редактора


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public cookieService: CookieService,
                public articlesProvider: ArticlesProvider) {
        this.id = navParams.get('id');
        this.confirm = navParams.get('confirm');
    }

    ionViewWillEnter() {
        this.cookieValue = localStorage.getItem('forCookieValue');
        const userCookieJson = JSON.parse(this.cookieValue);
        this.users = userCookieJson.roles;

        this.sub1 = this.articlesProvider
            .getOneArticleById(this.id, this.confirm)
            .subscribe((res) => {
                if (Array.isArray(res)) {
                    this.article = res[0];
                    this.commentForAuthor = this.article.commentsByEditor.reverse();
                    this.commentForEditor = this.article.commentsByPublisher.reverse();
                } else {
                    this.article = res;
                    this.commentForAuthor = this.article.commentsByEditor.reverse();
                    this.commentForEditor = this.article.commentsByPublisher.reverse();
                }
            }, (err) => {
                console.error(err);
            })
    }

    // показывать для редактора
    canShowForEditor(): boolean {
        if (this.users) {
            return this.users.filter((x) => (x === 'CN=NEWS_Editor')).length > 0;
        } else {
            return false;
        }
    }

    // показывать для автора
    canShowForAuthor(): boolean {
        if (this.users) {
            return this.users.filter((x) => (x === 'CN=NEWS_Author')).length > 0;
        } else {
            return false;
        }
    }

    // возврат к статьям
    backForArticles() {
        this.navCtrl.pop();
    }

    ionViewWillUnload() {
        this.sub1.unsubscribe();
    }
}

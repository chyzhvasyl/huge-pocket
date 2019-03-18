import {Component} from '@angular/core';
import {
    ActionSheetController,
    Events,
    InfiniteScroll,
    IonicPage,
    ModalController,
    NavController,
    NavParams
} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {CommentsProvider} from "../../providers/comments/comments";
import {ArticlePage} from "../article/article";
import {CookieService} from "ngx-cookie-service";
import {howmMachLoad} from "../../app/enviroment";

@IonicPage()
@Component({
    selector: 'page-comments',
    templateUrl: 'comments.html',
})
export class CommentsPage {

    sub1: Subscription;                 // подписка на получение всех комментариев
    comments = [];                      // комментарии
    com: any;                           // один комментарий
    users: any;                         // список ролей пользователя
    cookieValue: any;                   // значение куков
    countForAuthor: number;
    countForAll: number;
    endComments = false;
    userById: any;                      // id
    preloader = false;                  // отображение прелоадера

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public commentsProvider: CommentsProvider,
                public actionSheetCtrl: ActionSheetController,
                public modalCtrl: ModalController,
                public cookieService: CookieService,
                public events: Events) {
    }

    ionViewWillEnter() {
        this.preloader = true;
        this.cookieValue = localStorage.getItem('forCookieValue');
        const userCookieJson = JSON.parse(this.cookieValue);
        this.userById = userCookieJson._id;
        this.users = userCookieJson.roles;
        console.log(this.users);

        this.users.forEach((x)  => {
            // запрос всех статей для автора
            if (x === 'CN=NEWS_Author') {
                this.countForAuthor = 0;

                this.sub1 = this.commentsProvider
                    .getAllCommentsForUser(this.countForAuthor)
                    .subscribe((res: Array<any>) => {
                        this.preloader = false;

                        if(this.comments.length === 0 ) {
                            this.comments = res;
                        } else {
                            res.forEach(x => {
                                let name: boolean = false;
                                this.comments.forEach(y => {
                                    if(y._id === x._id) {
                                        name = true;
                                    }
                                });
                                if(!name) {
                                    this.comments.push(x);
                                }
                            });

                            console.log('comment for auth',this.comments);
                        }
                    }, (err) => {
                        console.error(err);
                    })

            }
            if (x === 'CN=NEWS_Administrator' || x === 'CN=NEWS_Editor' || x === 'CN=NEWS_publisher') {
                this.countForAll = 0;

                this.sub1 = this.commentsProvider
                    .getAllComments(this.countForAll)
                    .subscribe((res: Array<any>) => {
                        this.preloader = false;

                        if(this.comments.length === 0 ) {
                            this.comments = res;
                        } else {
                            res.forEach(x => {
                                let name: boolean = false;
                                this.comments.forEach(y => {
                                    if(y._id === x._id) {
                                        name = true;
                                    }
                                });
                                if(!name) {
                                    this.comments.push(x);
                                }
                            });

                            console.log('CN=NEWS_Administrator, CN=NEWS_Editor, CN=NEWS_publisher',this.comments);
                        }
                    }, (err) => {
                        console.error(err);
                    })
            }
        });
    }

    // работа с комментарием
    doWithComment(comment) {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Комментарий',
            buttons: [
                {
                    text: 'Перейти на статью',
                    handler: () => {
                        console.log("4");
                        this.events.publish('goToArticle', 'comment');
                        const modal = this.modalCtrl.create(ArticlePage, {
                            'id': comment.article._id,
                            'comment': 'comment'
                        });
                        modal.present();
                    }
                },{
                    text: 'Опубликовать',
                    cssClass:  this.users.filter((x) => (x === 'CN=NEWS_Author')).length > 0 ? 'display__none' : null,
                    handler: () => {
                        this.com = {
                            'body': comment.body,
                            'confirmation': true,
                            'emailOrTelephore': comment.email,
                            'time': comment.time,
                            '_id': comment._id
                        };

                        this.commentsProvider
                            .changeStatusComent(this.com)
                            .subscribe((res) => {
                                const idx = this.comments
                                    .findIndex(c => c._id === this.com._id);
                                this.comments[idx] = res;
                            }, (err) => {
                                console.error(err);
                            });
                    }
                },{
                    text: 'Удалить',
                    handler: () => {
                        this.commentsProvider
                            .deleteOneComment(comment)
                            .subscribe((res) => {
                                this.comments = this.comments.filter( c => c._id !== comment._id);

                            }, (err) => {
                                console.error(err);
                            });
                    }
                }
            ]
        });
        actionSheet.present();
    }

    doInfinite(infiniteScroll: InfiniteScroll) {

        this.users.forEach((x)  => {
            // запрос всех статей для автора
            if (x === 'CN=NEWS_Author') {
                this.countForAuthor = this.countForAuthor + 1;
                this.sub1 = this.commentsProvider
                    .getAllCommentsForUser(this.countForAuthor)
                    .subscribe((res) => {

                        res.forEach(x => {
                            let name: boolean = false;
                            this.comments.forEach(y => {
                                if(y._id === x._id) {
                                    name = true;
                                }
                            });
                            if(!name) {
                                this.comments.push(x);
                            }
                        });

                        console.log('Async operation has ended');
                        this.displayEndArticles(res);
                        infiniteScroll.complete();


                    }, (err) => {
                        console.error(err);
                    })

            }
            if (x === 'CN=NEWS_Administrator' || x === 'CN=NEWS_Editor' || x === 'CN=NEWS_publisher') {
                this.countForAll = this.countForAll + 1;
                this.commentsProvider
                    .getAllComments(this.countForAll)
                    .subscribe((res) => {
                        // const addArticle = res;

                        res.forEach(x => {
                            let name: boolean = false;
                            this.comments.forEach(y => {
                                if(y._id === x._id) {
                                    name = true;
                                }
                            });
                            if(!name) {
                                this.comments.push(x);
                            }
                        });

                        console.log('Async operation has ended');
                        this.displayEndArticles(res);
                        infiniteScroll.complete();


                    }, (err) => {
                        console.error(err);
                    })
            }
        });
    }

    ionViewWillUnload() {
    }
    displayEndArticles(array){
        if (array.length < howmMachLoad){
            this.endComments = true;
            document.querySelectorAll('ion-infinite-scroll')[0].classList.remove("margin_bot");
        }
    }
    ionViewDidLeave () {
        this.sub1.unsubscribe();
        this.endComments = false;

        // infiniteScroll.position('top')
    }
}

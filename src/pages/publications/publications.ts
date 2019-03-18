import {Component} from "@angular/core";
import {
    ActionSheetController,
    AlertController,
    Events, InfiniteScroll,
    IonicPage, ModalController,
    NavController,
    NavParams,
    Platform
} from "ionic-angular";
import {ArticlesProvider} from "../../providers/articles/articles";
import {Subscription} from "rxjs";
import {PreviewArticlePage} from "../preview-article/preview-article";
import {EditArticlePage} from "../edit-article/edit-article";
import {CookieService} from "ngx-cookie-service";
import {ForAprovePage} from "../for-aprove/for-aprove";
import {MessagePubAndEditorPage} from "../message-pub-and-editor/message-pub-and-editor";
import {howmMachLoad} from "../../app/enviroment";
import {CacheService} from "../../providers/cacheService/cacheProvider";
import {Constants} from "../../classes/constants";

@IonicPage()
@Component({
    selector: 'page-publications',
    templateUrl: 'publications.html',
})
export class PublicationsPage {

    sub: Subscription;                  // подписка на получение статей
    articles = [];                      // статьи
    article:any;                        // одна статья
    editArticle: any;                   // статья для редактирования
    users = [];                         // список ролей пользователя
    userById: any;                      // id пользователя
    cookieValue: any;                   // значение куков
    preloader = false;                  // отображение прелоадера
    enter: any;                         // прослушиваемое событие по нотисам
    countForAdmin: number;
    countForAuthor: number;
    countForEditor: number;
    countForPublisher: number;
    endArticles = false;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public articlesProvider: ArticlesProvider,
                public actionSheetCtrl: ActionSheetController,
                public platform: Platform,
                public alertCtrl: AlertController,
                public cookieService: CookieService,
                public events: Events,
                public modalCtrl: ModalController,
                private cacheservice: CacheService) {

        events.subscribe('user:created', (enter) => {
            this.enter = enter;
            if ( this.enter && this.enter.status ) {
                const indexOfArticleToUpdate = this.articles
                    .findIndex(a => a._id === this.enter._id);
                if (indexOfArticleToUpdate === -1) {
                    console.log('PublicationsPage user:created', enter);
                    this.articles.unshift(enter);
                }
            }
        });
    }

    ionViewWillEnter() {
        this.preloader = true;
        this.cookieValue = localStorage.getItem('forCookieValue');
        const userCookieJson = JSON.parse(this.cookieValue);
        this.users = userCookieJson.roles;

        this.userById = userCookieJson._id;
        console.log("куки");
        console.log(this.users);


        this.users.forEach((x)  => {
            console.log(x);
            // запрос всех статей для админа
            if (x === 'CN=NEWS_Administrator') {

                this.countForAdmin = 0;

                this.sub = this.articlesProvider
                    .getAllArticles(this.countForAdmin)
                    .subscribe((res: Array<any>) => {

                        this.preloader = false;

                            if(this.articles.length === 0 ) {
                                this.articles = res;
                            } else {
                                res.forEach(x => {
                                    let name: boolean = false;
                                    this.articles.forEach(y => {
                                       if(y._id === x._id) {
                                           name = true;
                                       }
                                    });
                                    if(!name) {
                                        this.articles.push(x);
                                    }
                                })
                            }


                    }, (err) => {
                        console.error(err);
                    });

                // запрос всех статей для автора
            }
            if (x === 'CN=NEWS_Author') {

                this.countForAuthor = 0;

                this.sub = this.articlesProvider
                    .findAllArticlesByUserId(this.userById, this.countForAuthor)
                    .subscribe((res: Array<any>) => {
                        this.preloader = false;

                        if(this.articles.length === 0 ) {
                            this.articles = res;
                        } else {
                            res.forEach(x => {
                                let name: boolean = false;
                                this.articles.forEach(y => {
                                    if(y._id === x._id) {
                                        name = true;
                                    }
                                });
                                if(!name) {
                                    this.articles.push(x);
                                }
                            })
                        }
                    }, (err) => {
                        console.error(err);
                    });

            }
            if (x === 'CN=NEWS_Editor') {

                this.countForEditor = 0;

                this.sub = this.articlesProvider
                    .findAllArticlesByCreated(this.countForEditor)
                    .subscribe((res: Array<any>) => {
                        this.preloader = false;

                        if(this.articles.length === 0 ) {
                            this.articles = res;
                        } else {
                            res.forEach(x => {
                                let name: boolean = false;
                                this.articles.forEach(y => {
                                    if(y._id === x._id) {
                                        name = true;
                                    }
                                });
                                if(!name) {
                                    this.articles.push(x);
                                }
                            })
                        }
                    }, (err) => {
                        console.error(err);
                    })
            }
            if (x === 'CN=NEWS_publisher') {

                this.countForPublisher = 0;

                this.sub = this.articlesProvider
                    .findAllArticlesByModified(this.countForPublisher)
                    .subscribe((res: Array<any>) => {
                        this.preloader = false;

                        if(this.articles.length === 0 ) {
                            this.articles = res;
                        } else {
                            res.forEach(x => {
                                let name: boolean = false;
                                this.articles.forEach(y => {
                                    if(y._id === x._id) {
                                        name = true;
                                    }
                                });
                                if(!name) {
                                    this.articles.push(x);
                                }
                            })
                        }
                    }, (err) => {
                        console.error(err);
                    })
            }
        })
    }

    doWithArticle(article) {
        this.article = article;
        this.editArticle = JSON.parse(JSON.stringify(this.article));

        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
               {
                    text: 'Предпросмотр',
                    handler: () => {
                        const modal = this.modalCtrl.create(PreviewArticlePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                        modal.present();
                    }

                },{
                    text: 'Опубликовать',
                    cssClass:  (this.article.status === "modified" && this.users.filter((x) => (x === 'CN=NEWS_publisher' || x === 'CN=NEWS_Administrator')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const prompt = this.alertCtrl.create({
                            title: 'Опубликовать статью?',
                            buttons: [
                                {
                                    text: 'Да',
                                    cssClass: 'alertDanger',
                                    handler: () => {
                                        this.editArticle = {
                                            '_id': this.editArticle._id,
                                            'status': 'published',
                                            'confirmation': true,
                                            'timeOfPublication': new Date()
                                        };

                                        this.articlesProvider
                                            .publicateOneArticle(this.editArticle)
                                            .subscribe((res) => {
                                                const idx = this.articles
                                                    .findIndex(a => a._id === this.editArticle._id);

                                                this.articles[idx].status = this.editArticle.status;
                                                this.articles[idx].confirmation = this.editArticle.confirmation;
                                                this.articles[idx].timeOfPublication = this.editArticle.timeOfPublication;
                                                this.cacheservice.cacheMap.clear();
                                            }, (err) => {
                                                console.error(err);
                                            });
                                    }
                                },
                                {
                                    text: 'Нет',
                                    cssClass: 'alertCancel',
                                    handler: () => {

                                    }
                                }
                            ]
                        });
                        prompt.present();
                    }
                },{
                    text: 'Удалить',
                    cssClass:  this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length > 0 ? null : 'display__none',
                    handler: () => {
                        const prompt = this.alertCtrl.create({
                            title: 'Удалить статью?',
                            buttons: [
                                {
                                    text: 'Да',
                                    cssClass: 'alertDanger',
                                    handler: () => {
                                        this.articlesProvider
                                            .deleteOneArticle(this.article)
                                            .subscribe((res) => {
                                                this.articles = this.articles.filter( a => a._id !== this.article._id);
                                                this.cacheservice.cacheMap.clear();
                                                this.articlesProvider.presentToastWithOptions('del');
                                            }, (err) => {
                                                console.error(err);
                                            });
                                    }
                                },
                                {
                                    text: 'Нет',
                                    cssClass: 'alertCancel',
                                    handler: () => {

                                    }
                                }
                            ]
                        });
                        prompt.present();
                    }
                },{
                    text: 'Редактировать',
                    cssClass:  ((this.article.status === "not approved by editor" && this.users.filter((x) => (x === 'CN=NEWS_Author'))).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const modal = this.modalCtrl.create(EditArticlePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });

                        modal.onDidDismiss(data => {
                            if(data) {
                                console.log('MODAL DATA', data);
                                const idx = this.articles
                                    .findIndex(a => a._id === data._id);
                                this.articles[idx].title = data.title;
                            }
                        });
                        modal.present();
                    }
                },
                {
                    text: 'Редактировать',
                    cssClass:  ((this.users.filter((x) => (x === 'CN=NEWS_Administrator'))).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const modal = this.modalCtrl.create(EditArticlePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });

                        modal.onDidDismiss(data => {
                            if(data) {
                                console.log('MODAL DATA', data);
                                const idx = this.articles
                                    .findIndex(a => a._id === data._id);
                                this.articles[idx].title = data.title;
                            }
                        });
                        modal.present();
                    }
                },
                {
                    text: 'Редактировать',
                    cssClass:  (((this.article.status === "created" || this.article.status === "not approved by publisher") && this.users.filter((x) => (x === 'CN=NEWS_Editor'))).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const modal = this.modalCtrl.create(EditArticlePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });

                        modal.onDidDismiss(data => {
                            if(data) {
                                console.log('MODAL DATA', data);
                                const idx = this.articles
                                    .findIndex(a => a._id === data._id);
                                this.articles[idx].title = data.title;
                            }
                        });
                        modal.present();
                    }
                },{
                    text: 'Утвердить',
                    cssClass:  (this.article.status === "created" && this.users.filter((x) => (x === 'CN=NEWS_Editor')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const prompt = this.alertCtrl.create({
                            title: 'Утвердить статью?',
                            buttons: [
                                {
                                    text: 'Да',
                                    cssClass: 'alertDanger',
                                    handler: () => {
                                        this.editArticle = {
                                            '_id': this.editArticle._id,
                                            'status': 'modified',
                                        };
                                        this.articlesProvider
                                            .publicateOneArticle(this.editArticle)
                                            .subscribe((res) => {
                                                const idx = this.articles
                                                    .findIndex(a => a._id === this.editArticle._id);
                                                this.articles[idx].status = this.editArticle.status;
                                            }, (err) => {
                                                console.error(err);
                                            });
                                    }
                                },
                                {
                                    text: 'Нет',
                                    cssClass: 'alertCancel',
                                    handler: () => {

                                    }
                                }
                            ]
                        });
                        prompt.present();
                    }
                },{
                    text: 'Утвердить',
                    cssClass:  (this.article.status === "created" && this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const prompt = this.alertCtrl.create({
                            title: 'Утвердить статью?',
                            buttons: [
                                {
                                    text: 'Да',
                                    cssClass: 'alertDanger',
                                    handler: () => {
                                        this.editArticle = {
                                            '_id': this.editArticle._id,
                                            'status': 'modified',
                                        };
                                        this.articlesProvider
                                            .publicateOneArticle(this.editArticle)
                                            .subscribe((res) => {
                                                const idx = this.articles
                                                    .findIndex(a => a._id === this.editArticle._id);
                                                this.articles[idx].status = this.editArticle.status;
                                            }, (err) => {
                                                console.error(err);
                                            });
                                    }
                                },
                                {
                                    text: 'Нет',
                                    cssClass: 'alertCancel',
                                    handler: () => {

                                    }
                                }
                            ]
                        });
                        prompt.present();
                    }
                },
                {
                    text: 'На проверку',
                    cssClass: (this.article.status === "not approved by editor" && this.users.filter((x) => (x === 'CN=NEWS_Author')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const changeStatus = {
                            '_id': this.article._id,
                            'status': 'created'
                        };

                        this.articlesProvider
                            .changeArticle(changeStatus)
                            .subscribe((res) => {
                                const idx = this.articles
                                    .findIndex(a => a._id === this.editArticle._id);
                                this.articles[idx].status = 'created';
                            }, (err) => {
                                console.error(err);
                            });
                    }
                },  {
                    text: 'На проверку',
                    cssClass: (this.article.status === "not approved by editor" && this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        const changeStatus = {
                            '_id': this.article._id,
                            'status': 'created'
                        };

                        this.articlesProvider
                            .changeArticle(changeStatus)
                            .subscribe((res) => {
                                const idx = this.articles
                                    .findIndex(a => a._id === this.editArticle._id);
                                this.articles[idx].status = 'created';
                            }, (err) => {
                                console.error(err);
                            });
                    }
                },
                {
                    text: 'Не утверждена',
                    cssClass:   ((this.article.status === "created" || this.article.status === "not approved by publisher") && this.users.filter((x) => (x === 'CN=NEWS_Editor')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(ForAprovePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                },{
                    text: 'Не утверждена',
                    cssClass: (this.article.status === "modified" && this.users.filter((x) => (x === 'CN=NEWS_publisher')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(ForAprovePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                },
                {
                    text: 'Не утверждена',
                    cssClass:   ((this.article.status === "created" || this.article.status === "not approved by publisher") && this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(ForAprovePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                },{
                    text: 'Не утверждена',
                    cssClass: (this.article.status === "modified" && this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length) > 0 ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(ForAprovePage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                },
                {
                    text: 'Cообщение',
                    cssClass:  this.users.filter((x) => (x === 'CN=NEWS_Author')).length > 0 && this.article.status === 'not approved by editor' ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(MessagePubAndEditorPage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                },{
                    text: 'Cообщение',
                    cssClass:  this.users.filter((x) => (x === 'CN=NEWS_Editor')).length > 0 && this.article.status === 'not approved by publisher' ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(MessagePubAndEditorPage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                },
                {
                    text: 'Cообщение от редактора',
                    cssClass:  this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length > 0 && this.article.status === 'not approved by editor' ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(MessagePubAndEditorPage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                },{
                    text: 'Cообщение от публикатора',
                    cssClass:  this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length > 0 && this.article.status === 'not approved by publisher' ? null : 'display__none',
                    handler: () => {
                        this.navCtrl.push(MessagePubAndEditorPage, {
                            id : article._id,
                            confirm: article.confirmation
                        });
                    }
                }
            ]
        });
        actionSheet.present();
    }

    doInfinite(infiniteScroll: InfiniteScroll) {
        console.log('Begin async operation');

        this.users.forEach((x)  => {
            // запрос всех статей для админа
            if (x === 'CN=NEWS_Administrator') {

                this.countForAdmin = this.countForAdmin + 1;

                this.sub = this.articlesProvider
                    .getAllArticles(this.countForAdmin)
                    .subscribe((res: Array<any>) => {
                        console.log('res ---- --- ---', res)

                        // const partArticles = res;
                        //
                        // for (let i = 0; i < partArticles.length; i++) {
                        //     this.articles.push( partArticles[i] );
                        // }

                        res.forEach(x => {
                            let name: boolean = false;
                            this.articles.forEach(y => {
                                if(y._id === x._id) {
                                    name = true;
                                }
                            });
                            if(!name) {
                                this.articles.push(x);
                            }
                        });
                        this.displayEndArticles(res);
                        infiniteScroll.complete();

                    }, (err) => {
                        console.error(err);
                    });

                // запрос всех статей для автора
            }
            if (x === 'CN=NEWS_Author') {

                this.countForAuthor = this.countForAuthor + 1;
                this.sub = this.articlesProvider
                    .findAllArticlesByUserId(this.userById, this.countForAuthor)
                    .subscribe((res: Array<any>) => {
                        // const addArticle = res;
                        //
                        // for (let i = 0; i < Object.keys(addArticle).length; i++) {
                        //     this.articles.push( addArticle[i] );
                        // }
                        //
                        // if (Object.keys(addArticle).length < howmMachLoad) {
                        //     this.endArticles = true;
                        // }

                        res.forEach(x => {
                            let name: boolean = false;
                            this.articles.forEach(y => {
                                if(y._id === x._id) {
                                    name = true;
                                }
                            });
                            if(!name) {
                                this.articles.push(x);
                            }
                        });
                        this.displayEndArticles(res);
                        infiniteScroll.complete();
                    }, (err) => {
                        console.error(err);
                    });

            }
            if (x === 'CN=NEWS_Editor') {
                this.countForEditor = this.countForEditor + 1;
                this.sub = this.articlesProvider
                    .findAllArticlesByCreated(this.countForEditor)
                    .subscribe((res: Array<any>) => {
                        // const addArticle = res;
                        //
                        // for (let i = 0; i < Object.keys(addArticle).length; i++) {
                        //     this.articles.push( addArticle[i] );
                        // }
                        //
                        // if (Object.keys(addArticle).length < howmMachLoad) {
                        //     this.endArticles = true;
                        // }

                        res.forEach(x => {
                            let name: boolean = false;
                            this.articles.forEach(y => {
                                if(y._id === x._id) {
                                    name = true;
                                }
                            });
                            if(!name) {
                                this.articles.push(x);
                            }
                        });
                        this.displayEndArticles(res);
                        infiniteScroll.complete();
                    }, (err) => {
                        console.error(err);
                    })
            }

            if (x === 'CN=NEWS_publisher') {
                this.countForPublisher = this.countForPublisher + 1;
                this.sub = this.articlesProvider
                    .findAllArticlesByModified(this.countForPublisher)
                    .subscribe((res: Array<any>) => {
                        // const addArticle = res;
                        //
                        // for (let i = 0; i < Object.keys(addArticle).length; i++) {
                        //     this.articles.push( addArticle[i] );
                        // }
                        //
                        // if (Object.keys(addArticle).length < howmMachLoad) {
                        //     this.endArticles = true;
                        // }

                        res.forEach(x => {
                            let name: boolean = false;
                            this.articles.forEach(y => {
                                if(y._id === x._id) {
                                    name = true;
                                }
                            });
                            if(!name) {
                                this.articles.push(x);
                            }
                        });
                        this.displayEndArticles(res);
                        infiniteScroll.complete();
                    }, (err) => {
                        console.error(err);
                    })
            }
        })
    }
    displayEndArticles(array){
        if (array.length < howmMachLoad){
            this.endArticles = true;
            document.querySelectorAll('ion-infinite-scroll')[0].classList.remove("margin_bot");
        }
    }

    ionViewDidLeave() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
        this.endArticles = false;
    }
}

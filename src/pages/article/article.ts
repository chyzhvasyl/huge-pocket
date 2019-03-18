import {Component} from "@angular/core";
import {Events, IonicPage, NavController, NavParams, ToastController} from "ionic-angular";
import {FormControl, FormGroup, Validators, FormBuilder} from "@angular/forms";
import {RestProvider} from "../../providers/rest/rest";
import {CommentsProvider} from "../../providers/comments/comments";
import {ArticlesProvider} from "../../providers/articles/articles";
import {Subscription} from "rxjs/Subscription";
import {CookieService} from "ngx-cookie-service";
import {HomePage} from "../home/home";
import {Device} from "@ionic-native/device";
import {AuthPage} from "../auth/auth";

@IonicPage()
@Component({
    selector: 'page-article',
    templateUrl: 'article.html'
})
export class ArticlePage {

    article: any;                       // полученая статья
    articles: any;                      // все статьи для swipe
    filterSwipe: any;                   // для swipe подтягивать сатьи по категории или все
    id: string;                         // категории
    form: FormGroup;                    // форма для отправки комментария
    params: any;                        // парамментры вывода статей
    fontSizeTitle: any;                 // длина тайтла для валидации
    fontSizePreview: any;               // длина превъю для валидации
    fontSizeBody: any;                  // длина боди для валидации
    bgCollor = '#ffffff';               // фон статьиz
    sub1: Subscription;                 // подписка на получение параметров
    cookieValue: any;                   // значение полученых куки
    userById: any;                      // id
    enter: any;                         // прослушиваемое событие
    closeView = false;                  // для возврата на страницу комментариев
    forComment: any;                    // для возврата на страницу комментариев
    goToHomeWithCategory = false;       // для возврата на главную страницу и фильртации по категории
    goToHome = false;                   // для возврата на главную со всеми статьями
    comments: any;
    dislike: boolean;
    like: boolean;
    delateCacheForImage: any;           // убираем кеширование изображения
    animationState: string;
    count: number;
    tmplikes: any[];
    preloader: boolean;                  // отображение прелоадера
    commentBody: string;
    deviceId: string;


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public restProvider: RestProvider,
                public commentsProvider: CommentsProvider,
                public articlesProvider: ArticlesProvider,
                public cookieService: CookieService,
                public events: Events,
                public toastCtrl: ToastController, private device: Device,
                private fb: FormBuilder) {
this.preloader = false;

        this.form = new FormGroup({
            comment: new FormControl('', Validators.required)
        });

        this.id = navParams.get('id');
        this.filterSwipe = navParams.get('filterSwipe');
        this.count = navParams.get('count');
        this.forComment = navParams.get('comment');
        this.cookieValue = localStorage.getItem('forCookieValue');
        this.deviceId = localStorage.getItem('deviceId');
        if(this.cookieValue){
            const userCookieJson = JSON.parse(this.cookieValue);
            this.userById = userCookieJson._id;
        }
        if( this.commentBody){
            this.commentBody =  localStorage.getItem('commentBody');
        }
    }


    ionViewWillEnter() {
        this.delateCacheForImage = new Date();

        if (this.forComment) {
            this.closeView = true;
        }

        // для возврата на главную страницу и фильртации по категории
        if (this.filterSwipe === 'byCategory') {
            this.goToHomeWithCategory = true;
        } else {
            this.goToHome = true;
        }

        this.preloader = true;
        this.restProvider
            .findArticleById(this.id)
            .then(data => {
                this.preloader = false;
                this.article = data;
                this.comments = this.article.comments;
                this.tmplikes = this.article.likes;
                this.like = true;
                if(this.cookieValue){
                    this.tmplikes.forEach((x) =>  {
                        if(x === this.userById) {
                            this.like = false
                        }
                    });
                }else{
                    this.tmplikes.forEach((x) =>  {
                        if(x === this.deviceId) {
                            this.like = false
                        }
                    });


                }

            });

        this.sub1 = this.articlesProvider
            .getParams()
            .subscribe((res) => {
                this.params = res;
                this.params = this.params[0];
                this.fontSizeTitle = this.params.articleStyles.title.fontSize + 'px';
                this.fontSizePreview = this.params.articleStyles.shortBody.fontSize + 'px';
                this.fontSizeBody = this.params.articleStyles.body.fontSize + 'px';
                this.bgCollor = this.params.generalStyles.backgroundColor;
            }, (err) => {
                console.error(err);
            });
    }

    likeArticle(like) {
        if (like === 'like') {
            this.like = false;
            this.restProvider
                .likeArticle(this.id)
                .then(data => {
                    this.article.likes = data['likes'];
                });

        } else if (like === 'dislike') {
            this.like = true;
            this.restProvider
                .likeArticle(this.id)
                .then(data => {
                    this.article.likes = data['likes'];
                });
        }
    }

    // возврат к статьям
    backForArticles() {
        this.navCtrl.pop();
    }

    backHomeWithCategorySorting() {
        this.navCtrl.setRoot(HomePage, {
            category_id : this.article.category._id,
            filterForSwipe : "byCategory"
        });
    }

    backHome() {
        this.navCtrl.setRoot(HomePage, {
            filterForSwipe : "allArticles"
        });
    }

    // добавление комментария
    addComment() {
        if(this.userById){
            const comment = {
            // ‘emailOrTelephone’: this.form.value.phone,
        'body': this.form.value.comment,
               'confirmation': false
        };
            this.commentsProvider
                .addOneComment(this.article._id, this.userById, comment)
                .subscribe((res) => {
                    localStorage.removeItem('commentBody');
                    this.form.reset();
                }, (err) => {
                    console.error('error', err);
                });
        } else {
            this.navCtrl.push(AuthPage, {
                return : true,
                articleId: this.id
            });

        }
    }

    // листаем в лево
    startAnimation(state)  {

        // const toast = this.toastCtrl.create({
        //     message: state,
        //     duration: 3000,
        //     position: 'middle',
        //     showCloseButton: true,
        //     closeButtonText: 'Ok'
        // });
        // toast.present();

        if (state === 'left'){
            if (this.filterSwipe === "byCategory") {
                this.articlesProvider
                    .findAllArticlesByCategoryAndConfirmation(this.article.category._id, this.count)
                    .subscribe((res) => {
                        let id: any;
                        this.articles = res;
                        const idx = this.articles
                            .findIndex(a => a._id === this.article._id);
                        if (idx === (this.articles.length - 1)) {
                            // this.count++;
                            // this.articlesProvider
                            //     .findAllArticlesByCategoryAndConfirmation(this.article.category._id, this.count)
                            //     .subscribe((res)=>{
                            //         if (res[0]) {
                            //             console.log('resp888888888', res[0]);
                            //
                            //             this.navCtrl.push(ArticlePage, {
                            //                 id : res[0]._id,
                            //                 filterSwipe : this.filterSwipe,
                            //                 count: this.count
                            //             });
                            //         } else {
                            //             this.count--;
                            //         }
                            //     },(res)=> {
                            //
                            //     })

                        } else {
                            id = this.articles[idx + 1]._id;
                            console.log("2");
                            this.events.publish('user:left', this.article.category._id);
                            this.navCtrl.push(ArticlePage, {
                                id : id,
                                filterSwipe : this.filterSwipe,
                                count: this.count
                            })
                        }
                    }, (err) => {
                        console.error(err);
                    });
            } else {
                this.articlesProvider
                    .getAllArticlesByCOnfirmation(this.count)
                    .subscribe((res) => {
                        let id: any;
                        this.articles = res;
                        const idx = this.articles
                            .findIndex(a => a._id === this.article._id);

                        if (idx === (this.articles.length - 1)) {

                            // this.count = this.count + 1;
                            // this.articlesProvider
                            //     .getAllArticlesByCOnfirmation(this.count)
                            //     .subscribe((res)=>{
                            //
                            //         if (res[0]) {
                            //             this.navCtrl.push(ArticlePage, {
                            //                 id : res[0]._id,
                            //                 filterSwipe : this.filterSwipe,
                            //                 count: this.count
                            //             });
                            //         } else {
                            //
                            //             this.count--;
                            //             console.log('this.count', this.count);
                            //         }
                            //     },(res)=> {
                            //
                            //     })

                        } else {
                            id = this.articles[idx + 1]._id;

                            this.navCtrl.push(ArticlePage, {
                                id : id,
                                filterSwipe : this.filterSwipe,
                                count: this.count
                            })
                        }
                    }, (err) => {
                        console.error(err);
                    });
            }
        } else if (state === 'right'){
            if (this.filterSwipe === "byCategory" && this.count >= 0) {
                this.articlesProvider
                    .findAllArticlesByCategoryAndConfirmation(this.article.category._id, this.count)
                    .subscribe((res) => {
                        let id: any;
                        this.articles = res;
                        const idx = this.articles
                            .findIndex(a => a._id === this.article._id);
                        if (idx === 0) {
                            console.log('start articles');
                            this.count = this.count - 1;

                            if (this.count >= 0) {
                                this.articlesProvider
                                    .findAllArticlesByCategoryAndConfirmation(this.article.category._id, this.count)
                                    .subscribe((res) => {
                                        const newArticles: Array<any> = <Array<any>>res;
                                        console.log(newArticles);
                                        const newArticle = newArticles[newArticles.length-1]._id;
                                        console.log('last article',typeof res);


                                        this.navCtrl.push(ArticlePage, {
                                            id: newArticle,
                                            filterSwipe: this.filterSwipe,
                                            count: this.count
                                        });
                                    }, (err) => {
                                        console.log(err);

                                    });
                            } else {
                                console.log('ничего не делаем');
                                this.count++;
                            }
                        } else {
                            id = this.articles[idx - 1]._id;
                            console.log("3");

                            this.events.publish('user:rigth', this.article.category._id);

                            this.navCtrl.push(ArticlePage, {
                                id : id,
                                filterSwipe : this.filterSwipe,
                                count: this.count
                            })
                        }
                    }, (err) => {
                        console.error(err);
                    });
            } else {
                this.articlesProvider
                    .getAllArticlesByCOnfirmation(this.count)
                    .subscribe((res) => {
                        let id: any;
                        this.articles = res;
                        const idx = this.articles
                            .findIndex(a => a._id === this.article._id);
                        if (idx === 0) {
                            this.count = this.count - 1;

                            if(this.count >= 0) {
                                this.articlesProvider
                                    .getAllArticlesByCOnfirmation(this.count)
                                    .subscribe((res)=>{
                                        const newArticles: Array<any> = <Array<any>>res;
                                        const newArticle = newArticles[newArticles.length-1]._id;

                                        this.navCtrl.push(ArticlePage, {
                                            id: newArticle,
                                            filterSwipe: this.filterSwipe,
                                            count: this.count
                                        });
                                    },(err)=> {
                                        console.error(err);

                                    })
                            } else {
                                console.log('end articles');
                                this.count++
                            }

                        } else {
                            id = this.articles[idx - 1]._id;

                            this.navCtrl.push(ArticlePage, {
                                id : id,
                                count: this.count
                            })
                        }
                    }, (err) => {
                        console.error(err);
                    });
            }
        }
    }

    imageLoaded(imgforArticle: Element, imageforArticlePreloader: Element) {
        imageforArticlePreloader.classList.toggle('hide');
        imgforArticle.classList.toggle('hide');
    }

    ionViewWillUnload()  {
        if(this.commentBody){
            localStorage.setItem('commentBody', this.form.value.comment);
        }

        this.sub1.unsubscribe();
    }
}

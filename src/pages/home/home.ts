import {Component} from '@angular/core';
import {Events, InfiniteScroll, NavController, NavParams} from 'ionic-angular';
import {RestProvider} from '../../providers/rest/rest';
import {ArticlePage} from '../article/article';
import {Subscription} from "rxjs/Subscription";
import {ArticlesProvider} from "../../providers/articles/articles";
import {howmMachLoad} from "../../app/enviroment";
import {isObject} from "util";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    articles: any;                      // все статьи
    filterForSwipe: string;             // qwery парамметры для передачи в одну статью
    lastArticle: any;                   // выбираем последнюю статью
    lastArticleByCategory: any;                   // выбираем последнюю статью
    articlesByCategory: any;            // статьи по категории
    category_id: string;                // id категории
    confirmation_true: string = 'true';
    sub1: Subscription;                 // подписка на получение параметров
    params: any;                        // парамментры вывода статей
    fontSizeTitle: any;                 // длина тайтла для валидации
    fontSizePreview: any;               // длина превъю для валидации
    preloader = true;                  // отображение прелоадера
    delateCacheForImage: any;           // убираем кеширование изображения
    enter: any;                         // прослушиваемое событие по нотисам
    count: number;
    endArticles = false;
    endArticlesForCategory = false;
    presentArticles: boolean = false;

    constructor(public navCtrl: NavController,
                public restProvider: RestProvider,
                public navParams: NavParams,
                public articlesProvider: ArticlesProvider,
                public events: Events) {
        this.category_id = navParams.get('category_id');
        this.filterForSwipe = navParams.get('filterForSwipe');
        this.events.subscribe('user:created', (enter) => {
            this.enter = enter;
            if (this.enter.status === 'published' && this.category_id === this.enter.category)
            {
                this.articles.unshift(this.enter);
            }
        });
        this.events.publish('refresh-user-roles', 'home');
    }

    ionViewWillEnter() {

        if (this.category_id) {
            this.findAllArticlesByCategory();
        } else {
            this.findAllArticlesByConfirmation();
        }
        this.sub1 = this.articlesProvider
            .getParams()
            .subscribe((res) => {
                this.params = res;
                this.params = this.params[0];
                this.fontSizeTitle = this.params.articleStyles.title.fontSize + 'px';
                this.fontSizePreview = this.params.articleStyles.shortBody.fontSize + 'px';
            }, (err) => {
                console.error(err);
            }, () => {

            });
        this.delateCacheForImage = new Date();
    }

    findAllArticles() {
        this.restProvider
            .findAllArticles()
            .then(data => {
                this.articles = data;
                this.articles.forEach(article => {
                    if (article.img) {
                        article.img.data.data =  new Uint8Array(article.img.data.data);
                        article.img.data.data = this.Uint8ToBase64(article.img.data.data);
                        article.img.data.data = 'data:image/*;base64,'+article.img.data.data;
                    }
                });
            });
    }

    Uint8ToBase64(u8Arr) {
        let CHUNK_SIZE = 0x8000; //arbitrary number
        let index = 0;
        let length = u8Arr.length;
        let result = '';
        let slice;
        while (index < length) {
            slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
            result += String.fromCharCode.apply(null, slice);
            index += CHUNK_SIZE;
        }
        return btoa(result);
    }

    findAllArticlesByCategory() {
        this.count = 0;
        this.restProvider.findAllArticlesByCategory(this.category_id, this.count)
            .then(data => {
                this.articles = data;
                this.preloader = false;
                    this.articles
                        .forEach(articleByCategory => {
                            if (articleByCategory.img) {
                                articleByCategory.img.data.data = new Uint8Array(articleByCategory.img.data.data);
                                articleByCategory.img.data.data = this.Uint8ToBase64(articleByCategory.img.data.data);
                                articleByCategory.img.data.data = 'data:image/*;base64,' + articleByCategory.img.data.data;
                            }
                        });
            })
    }

    findAllArticlesByConfirmation() {
        this.count = 0;
        this.restProvider
            .findAllArticlesByConfirmation(this.confirmation_true, this.count)
            .then(data => {
                this.articles = data;
                this.preloader = false;
                this.articles.forEach(articles => {
                    if (articles.img) {
                        articles.img.data.data =  new Uint8Array(articles.img.data.data);
                        articles.img.data.data = this.Uint8ToBase64(articles.img.data.data);
                        articles.img.data.data = 'data:image/*;base64,'+ articles.img.data.data;
                    }
                });
            })
    }

    articleTapped(article, status){
        let foundCount;
        if (status === 'category'){
            const idx = this.articles
                .findIndex(a => a._id === article._id);
            const foundIdx = idx + 1;
            foundCount = Math.trunc(foundIdx / howmMachLoad);
        } else if(status === 'all') {
            const idx = this.articles
                .findIndex(a => a._id === article._id);
            const foundIdx = idx + 1;
            foundCount = Math.trunc(foundIdx / howmMachLoad);
        }
        this.navCtrl.push(ArticlePage, {
            id: article._id,
            filterSwipe: this.filterForSwipe,
            count: foundCount
        });
    }
    doInfinite(infiniteScroll: InfiniteScroll) {
        this.count = this.count + 1;
        if(this.category_id){
            this.restProvider.findAllArticlesByCategory(this.category_id, this.count)
                .then(data => {
                    this.selectUniqueArticles(data);
                    infiniteScroll.complete();
                })
        }else{
            this.restProvider
                .findAllArticlesByConfirmation(this.confirmation_true, this.count)
                .then(data => {
                    this.selectUniqueArticles(data);
                    infiniteScroll.complete();
                })
        }
    }
    selectUniqueArticles(data){
        const addArticle = <any[]>  data;
        const newChunkUniqueArticles = addArticle.filter(uniqueArticle => {
            const duplicateArticle = this.articles.filter(newChunkArticle => newChunkArticle._id === uniqueArticle._id);
            return !duplicateArticle.length;
        });
        this.articles.push(...newChunkUniqueArticles);
        if (addArticle.length < howmMachLoad) {
            this.endArticles = true;
        }
    }

    deleteMarginStyle(articles){
        if(articles.length < howmMachLoad){
            document.querySelectorAll('ion-infinite-scroll')[0].classList.remove("margin_bot");
        }


    }

    imageLoaded(img: Element, imagePreloader: Element) {
        imagePreloader.classList.toggle('hide');
        img.classList.toggle('hide');
    }


    imageLoadedFirstArticle(image: Element, imagePreloaderFirstArticle: Element) {
        imagePreloaderFirstArticle.classList.toggle('removeHidden');
        image.classList.toggle('removeHidden');
    }

    firstImageCategoryLoaded(imageFirstCategory: Element, imagePreloaderFirstArticleByCategory: Element) {
        imagePreloaderFirstArticleByCategory.classList.toggle('removeHidden');
        imageFirstCategory.classList.toggle('removeHidden');
    }

    imagesByCateforiLoaded(imagesByCatefori: Element, imagesByCateforiPreloader: Element) {
        imagesByCateforiPreloader.classList.toggle('hide');
        imagesByCatefori.classList.toggle('hide');
    }

    ionViewCanLeave() {
        this.sub1.unsubscribe();
    }
}
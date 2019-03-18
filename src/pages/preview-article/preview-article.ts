import {Component} from "@angular/core";
import {IonicPage, NavParams, ViewController} from "ionic-angular";
import {Subscription} from "rxjs/Subscription";
import {ArticlesProvider} from "../../providers/articles/articles";

@IonicPage()
@Component({
    selector: 'page-preview-article',
    templateUrl: 'preview-article.html',
})
export class PreviewArticlePage {

    id: string;                     // id статьи
    confirm: boolean;               // для передали в запросе confirmation самой статьи
    sub1: Subscription;             // получение статьи
    article: any;                   // статья
    delateCacheForImage: any;       // убираем кеширование изображения
    preloader = false;              // отображение прелоадера

    constructor(public viewCtrl: ViewController,
                public navParams: NavParams,
                public articlesProvider: ArticlesProvider) {

        this.id = navParams.get('id');
        this.confirm = navParams.get('confirm');
    }

    ionViewWillEnter() {
        this.delateCacheForImage = new Date();
        this.preloader = true;

        this.sub1 = this.articlesProvider
            .getOneArticleById(this.id, this.confirm)
            .subscribe((res) => {
                if (Array.isArray(res)) {
                    this.preloader = false;
                    this.article = res[0];
                } else {
                    this.preloader = false;
                    this.article = res;
                }
            }, (err) => {
                console.error(err);
            })

    }

    // возврат к статьям
    backForArticles() {
        this.viewCtrl.dismiss();
    }

    imageLoaded(imgforArticle: Element, imageforArticlePreloader: Element) {
        imageforArticlePreloader.classList.toggle('hide');
        imgforArticle.classList.toggle('hide');
    }

    ionViewWillUnload() {
        this.sub1.unsubscribe();
        this.article = [];
    }
}

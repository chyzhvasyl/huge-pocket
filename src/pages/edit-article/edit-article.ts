
import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {ArticlesProvider} from "../../providers/articles/articles";
import {Subscription} from "rxjs/Subscription";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoryProvider} from "../../providers/category/category";
import {NgxPicaService} from "ngx-pica";
import {CookieService} from "ngx-cookie-service";
import {CropperSettings, ImageCropperComponent} from "ng2-img-cropper";
import {CacheService} from "../../providers/cacheService/cacheProvider";

@IonicPage()
@Component({
    selector: 'page-edit-article',
    templateUrl: 'edit-article.html',
})
export class EditArticlePage {

    id: string;                             // id аользователя
    sub1: Subscription;                     // подписка на получение статьи
    sub2: Subscription;                     // подписка на получение категорий
    sub3: Subscription;                     // подписка на получение параметров
    article: any;                           // одна статья
    categories: any;                        // категории
    form: FormGroup;                        // форма для получения значения радио кнопок
    input = false;                          // для отображения ввода имени категории
    newNameCategory: any;                   // имя новой категории
    lengthTitle = 10;                       // длина тайтла для валидации
    fontSizeTitle: any;                     // размер шрифта тайтла
    lengthPreview = 15;                     // длина превъю для валидации
    fontSizePreview: any;                   // размер шрифта превъю
    lengthBody = 15;                        // длина боди для валидации
    fontSizeBody: any;                      // размер шрифта боди
    quillLengthLarge = false;               // для добавления красной рамки при валидации текстового редактора
    quillLengthLessNeed = false;            // для добавления красной рамки при валидации текстового редактора
    params: any;                            // параметры для отображения статьи
    bigImg: any;                            // изображение 1280/720
    smallImg: any;                          // изображение  width = 258
    imageChangedEvent: any = '';            // для обработки изображения при загрузке
    croppedImage: any = '';                 // для обработки изображения при загрузке
    video: any;                             // загрузка видео
    format: any;                            // чтобы у большого и маленького изображения был один формат
    users: any;                             // роли пользователя
    cookieValue: any;                       // значение куки
    confirm: boolean;                       // для запроса статьи по ее confirmation
    delateCacheForImage: any;               // убираем кеширование изображения

    data:any;
    @ViewChild('cropper', undefined)
    cropper:ImageCropperComponent;
    cropperSettings: CropperSettings;
    preloader = false;                      // отображение прелоадера



    constructor(public navCtrl: NavController,
                public viewCtrl: ViewController,
                public navParams: NavParams,
                public articlesProvider: ArticlesProvider,
                public categoryProvider: CategoryProvider,
                public _ngxPicaService: NgxPicaService,
                public cookieService: CookieService,
                private cacheservice: CacheService) {

        this.id = navParams.get('id');
        this.confirm = navParams.get('confirm');

        // пересмотреть в дальнейшем, поставили в конструктор так как срабатывала валидации и нужных параметров
        // не было, они подтягивалясь, когда страница была уже открыта

        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;

        this.cropperSettings.width = 128;
        this.cropperSettings.minWidth = 64;
        this.cropperSettings.height = 72;
        this.cropperSettings.minWidth = 36;
        this.cropperSettings.croppedWidth =1280;
        this.cropperSettings.croppedHeight = 720;
        this.cropperSettings.canvasWidth = 300;
        this.cropperSettings.canvasHeight = 200;
        this.cropperSettings.compressRatio = 0.5;
        this.data = {};


        this.form = new FormGroup({
            header: new FormControl(null, [Validators.required, this.checkLengthTitle.bind(this)]),
            body: new FormControl(null, [Validators.required, this.checkLengthBody.bind(this)]),
            private: new FormControl(null),
            topNews: new FormControl(null),
            textPreview: new FormControl(null, [Validators.required, this.checkLengthPreview.bind(this)]),
            food: new FormControl(null, Validators.required)
        });

    }

    ionViewWillEnter() {
        this.delateCacheForImage = new Date();
        this.preloader = true;
        // получение параметров для валидации длины
        this.sub3 = this.articlesProvider
            .getParams()
            .subscribe((res) => {
                this.params = res;
                this.params = this.params[0].articleStyles;
                this.lengthTitle = this.params.title.length;
                this.fontSizeTitle = this.params.title.fontSize + 'px';
                this.lengthPreview = this.params.shortBody.length;
                this.fontSizePreview = this.params.shortBody.fontSize + 'px';
                this.lengthBody = this.params.body.length;
                this.fontSizeBody = this.params.body.fontSize + 'px';
            }, (err) => {
                console.error(err);
            });

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
            });

        this.sub2 = this.categoryProvider
            .getCategories()
            .subscribe((categories) => {
                this.categories = categories;
            }, (err) => {
                console.error(err);
            });


        this.cookieValue = localStorage.getItem('forCookieValue');
        const userCookieJson = JSON.parse(this.cookieValue);
        this.users = userCookieJson.roles;
    }

    // возврат на страницу всех статей
    backForArticles(status, editArticle?) {
        if(status === 'onlyBack') {
            this.viewCtrl.dismiss();
        } else if (status === 'editDone'){
            this.viewCtrl.dismiss(
                editArticle
            );
        }
    }

    // обработка изображения при загрузке
    fileChangeListener($event) {
        this.bigImg = {};
        this.data = {};

        if($event) {
            const image: any = new Image();
            const file: File = $event.target.files[0];
            const reader: FileReader = new FileReader();
            const that = this;
            this.bigImg = file;

            //для задания одного формата
            this.format = this.bigImg.type.slice(6);

            if (this.bigImg.type.includes('video')) {

                this.video = this.bigImg;

            } else {
                this.video = null;

                reader.onloadend = function (loadEvent: any) {

                    image.src = loadEvent.target.result;
                    that.cropper.setImage(image);
                };

                reader.readAsDataURL(file);
            }
        }
    }

    // обработка маленького изображения
    imageCropped(image: string) {
        this.croppedImage = image;
        this.smallImg = this.croppedImage;
    }

    // валидация на длины Title
    checkLengthTitle (control: FormControl) {
        if ( control.value && control.value.length > this.lengthTitle ) {
            return {
                'lengthTitleErr': true
            };
        }
        return null;
    }

    // валидация на длины Preview
    checkLengthPreview (control: FormControl) {
        if ( control.value && control.value.length > this.lengthPreview ) {
            return {
                'lengthPreviewErr': true
            };
        }
        return null;
    }

    // валидация на длины Body
    checkLengthBody (control: FormControl) {
        if (!control.value) {
            return null;
        }
        if (control.value.replace(/<[^>]+>/g, '').length > this.lengthBody ) {
            this.quillLengthLarge = true;

            return {
                'lengthBodyErr': true
            };
        } else {
            this.quillLengthLarge = false;
        }

        if (control.value.replace(/<[^>]+>/g, '').length <= 2) {
            this.quillLengthLessNeed = true;
        } else {
            this.quillLengthLessNeed = false;
        }
        return null;
    }

    // для добавления красной рамки при валидации текстового редактора
    getQuillErrorClass() {
        return {'invalid__quill': this.quillLengthLarge || this.quillLengthLessNeed };
    }

    // открытие добавления категории
    changeStatus() {
        this.input = !this.input;
    }

    // показывать возможность добавления категорий
    canShowAddCateg(): boolean {
        if (this.users) {
            return this.users.filter((x) => (x === 'CN=NEWS_Editor' || x === 'CN=NEWS_Administrator')).length > 0;
        } else {
            return false;
        }
    }

    // добавление категории
    addCategory() {
        this.preloader = true;
        const newCategory = {
            'name' : this.newNameCategory
        };
        this.sub2 = this.categoryProvider
            .addNewOneCategory(newCategory)
            .subscribe((res) => {
                this.categories.unshift(res);
                this.preloader = false;
            }, (err) => {
                console.error(err);
            });
        this.newNameCategory = '';
    }

    // сохраняем отредактированую статью
    saveChangedArticle() {
        this.preloader = true;
        this.bigImg = this.data.image;
        this.smallImg = this.data.image;
        const categoryId = this.form.value.food;
        if (this.bigImg) {
            this.article = {
                'fileBase64Small': this.smallImg,
                'fileBase64': this.bigImg,
                'title': this.article.title,
                'shortBody': this.article.shortBody,
                'body': this.article.body,
                'status': this.article.status,
                'likes': this.article.likes,
                'private':this.article.private,
                '_id': this.article._id,
                'topNews': this.article.topNews,
                'confirmation':  this.article.confirmation,
                'comments': this.article.comments,
                'category': this.article.category
            };
            this.articlesProvider
                .changeOneArticle(this.article, categoryId)
                .subscribe((res) => {
                    this.cacheservice.cacheMap.clear();
                    this.articlesProvider.presentToastWithOptions('edit');
                    this.backForArticles('editDone', res);
                    this.preloader = false;
                }, (err) => {
                    console.error(err);
                });

        } else if (this.video) {
            this.article = {
                'video': this.video,
                'title': this.article.title,
                'shortBody': this.article.shortBody,
                'body': this.article.body,
                'status': this.article.status,
                'likes': this.article.likes,
                '_id': this.article._id,
                'private':this.article.private,
                'topNews': this.article.topNews,
                'confirmation':  this.article.confirmation,
                'comments': this.article.comments,
                'category': this.article.category
            };

            this.articlesProvider
                .changeOneArticle(this.article, categoryId)
                .subscribe((res) => {
                    this.backForArticles('editDone', res);
                    this.cacheservice.cacheMap.clear();
                    this.articlesProvider.presentToastWithOptions('edit');
                    this.preloader = false;
                }, (err) => {
                    console.error(err);
                });
        } else {
            this.article = {
                'title': this.article.title,
                'shortBody': this.article.shortBody,
                'body': this.article.body,
                'status': this.article.status,
                'likes': this.article.likes,
                'private':this.article.private,
                '_id': this.article._id,
                'topNews': this.article.topNews,
                'confirmation':  this.article.confirmation,
                'comments': this.article.comments,
                'category': this.article.category
            };
            this.articlesProvider
                .changeOneArticle(this.article, categoryId)
                .subscribe((res) => {
                    this.cacheservice.cacheMap.clear();
                    this.articlesProvider.presentToastWithOptions('edit');
                    this.backForArticles('editDone', res);
                    this.preloader = false;
                }, (err) => {
                    console.error(err);
                });
        }
    }

    // для удаления кеширования изображения
    getCurrDate() {
        return new Date();
    }

    imageLoaded(imgforArticle: Element, imageforArticlePreloader: Element) {
        imageforArticlePreloader.classList.toggle('hide');
        imgforArticle.classList.toggle('hide');
    }
        ionViewWillUnload() {
        this.sub1.unsubscribe();
        this.sub2.unsubscribe();
        this.sub3.unsubscribe();
    }
}

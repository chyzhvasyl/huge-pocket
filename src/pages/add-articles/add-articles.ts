import {Component, ElementRef, ViewChild} from "@angular/core";
import {IonicPage, ModalController, NavController, NavParams} from "ionic-angular";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs/Subscription";
import {NgxPicaService} from "ngx-pica";
import {ArticlesProvider} from "../../providers/articles/articles";
import {CategoryProvider} from "../../providers/category/category";
import {PreviewAddArtivlePage} from "../preview-add-artivle/preview-add-artivle";
import Quill from "quill";
import {CookieService} from "ngx-cookie-service";
import {CropperSettings, ImageCropperComponent} from "ng2-img-cropper";
import { ImageCompressService} from  'ng2-image-compress';
import {CacheService} from "../../providers/cacheService/cacheProvider";

const Font = Quill.import('formats/font');
Font.whitelist = ['mirza', 'aref', 'gaegu', 'sans-serif', 'monospace', 'serif', 'roboto', 'helvetica', 'arial', 'hanalei'];
Quill.register(Font, true);

@IonicPage()
@Component({
    selector: 'page-add-articles',
    templateUrl: 'add-articles.html',
})
export class AddArticlesPage {

    description: '';                        // получение текста из texstarea
    form: FormGroup;                        // форма
    formPreview: any;                       // форма перед отправкой
    src: any;                               // создаем путь для загруженной картинки
    isValidFormSubmitted: boolean = null;   // для валидации input type="button"
    categories: any;                        // категории
    sub1: Subscription;                     // для подписи на получение данных о категориях
    sub2: Subscription;                     // для подписи на получение данных о категориях`
    bigImg: any;                            // изображение 1280/720
    smallImg: any;                          // изображение  width = 258
    video: any;                             // загрузка видео
    imageChangedEvent: any = '';            // для обработки изображения при загрузке
    croppedImage: any = '';                 // для обработки изображения при загрузке
    lengthTitle = 10;                       // длина тайтла для валидации
    lengthPreview = 15;                     // длина превъю для валидации
    lengthBody = 15;                        // длина боди для валидации
    quillLengthLarge = false;               //  для добавления красной рамки при валидации текстового редактора
    quillLengthLessNeed = false;            //  для добавления красной рамки при валидации текстового редактора
    params: any;                            // параметры для отображения статьи
    format: any;                            // чтобы у большого и маленького изображения был один формат
    header = '';                            // значение тайтла в форме
    title = '';
    userId: any;                            // id пользователя
    paramsId: any;                          // id параметров для стаетй
    cookieValue: any;                       // значение куки
    image: any;


    @ViewChild('fileInput') fileInput: ElementRef;

    data:any;
    @ViewChild('cropper', undefined)
    cropper:ImageCropperComponent;
    cropperSettings: CropperSettings;
    fileUploadValid = false;
    preloader = false;                  // отображение прелоадера

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public articlesProvider: ArticlesProvider,
                public _ngxPicaService: NgxPicaService,
                public categoryProvider: CategoryProvider,
                public modalCtrl: ModalController,
                public cookieService: CookieService,
                private cacheservice: CacheService) {

        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;

        this.cropperSettings.width = 128;
        this.cropperSettings.minWidth = 64;
        this.cropperSettings.height = 72;
        this.cropperSettings.minWidth = 36;
        this.cropperSettings.croppedWidth = 1280;
        this.cropperSettings.croppedHeight = 720;
        this.cropperSettings.canvasWidth = 300;
        this.cropperSettings.canvasHeight = 200;
        this.cropperSettings.compressRatio = 0.5;

        this.data = {};


        this.form = new FormGroup({
            header: new FormControl('', [Validators.required, this.checkLengthTitle.bind(this)]),
            body: new FormControl('', [Validators.required, this.checkLengthBody.bind(this)]),
            private: new FormControl(false),
            topNews: new FormControl(false),
            textPreview: new FormControl('', [Validators.required, this.checkLengthPreview.bind(this)]),
            food: new FormControl(null, Validators.required)
        });

        this.formPreview = {
            'img': '',
            'title': '',
            'body': '',
            'category': '',
            'status': '',
            'private': false,
            'topNews': false,
            'confirmation': true
        };

        this.cookieValue = localStorage.getItem('forCookieValue');
        const userCookieJson = JSON.parse(this.cookieValue);
        this.userId = userCookieJson._id;
    }

    imageHandler() {
        console.log("It's alive!!");
    }

    addBindingCreated(quill) {
        quill.editor.getModule('toolbar').addHandler('image', () => {

            let fileInput = quill.editor.options.modules.toolbar.container.querySelector('input.ql-image[type=file]');
            if (fileInput == null) {
                try {
                fileInput = document.createElement('input');
                fileInput.setAttribute('type', 'file');
                fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
                fileInput.classList.add('ql-image');
                }
                catch (e) {
                    console.log('Error' + e.name + ":mesage---->" + e.message + "\n" + e.stack);
                }
                fileInput.addEventListener('change', function () {
                if (fileInput.files != null && fileInput.files[0] != null) {
                    let reader = new FileReader();
                    reader.onload = function (e:any) {
                        ImageCompressService.filesToCompressedImageSource(fileInput.files).then(observableImages => {
                            observableImages.subscribe((image) => {
                                let range = quill.editor.getSelection(true);
                                quill.editor.updateContents(quill.editor.getContents(quill.editor.getLength() - 1, 0).retain(range.index).delete(range.length).insert({ image: image.compressedImage.imageDataUrl }), "user");
                                quill.editor.setSelection(range.index + 1, "silent");
                                fileInput.value = "";
                            }, (error) => {
                              console.log("Error while converting");
                            });
                          });
                    };
                    reader.readAsDataURL(fileInput.files[0]);
                }
                });
                console.log('fileees', fileInput);
                quill.editor.options.modules.toolbar.container.appendChild(fileInput);
            }
            fileInput.click();
        });
    }

    ionViewWillEnter() {
        // получение всех категорий
        this.sub1 = this.categoryProvider
            .getCategories()
            .subscribe((categories) => {
                this.categories = categories;
            });

        // получение параметров для валидации длины
        this.sub2 = this.articlesProvider
            .getParams()
            .subscribe((res) => {
                this.params = res;
                this.paramsId = this.params[0]._id;
                this.params = this.params[0].articleStyles;
                this.lengthTitle = this.params.title.length;
                this.lengthPreview = this.params.shortBody.length;
                this.lengthBody = this.params.body.length;
                //
            }, (err) => {
                console.error(err);
            });
    }

    // валидация на длины Title
    checkLengthTitle (control: FormControl) {
        if ( control.value && control.value.length > this.lengthTitle) {
            return {
                'lengthTitleErr': true
            };
        }
        return null;
    }

    // валидация на длины Preview
    checkLengthPreview (control: FormControl) {
        if (control && control.value) {
            let previewBody = control.value;
            previewBody = previewBody.trim();
            console.log(previewBody.length);
            if (previewBody && previewBody.length > this.lengthPreview) {
                return {
                    'lengthPreviewErr': true
                };
            }
            if (previewBody.length === 0) {
                return {
                    'onlySpace': true
                };
            }
            return null;
        }
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

    // обработка изображения при загрузке
    fileChangeListener($event) {
        this.bigImg = {};
        this.data = {};

        if($event) {
            this.checkImage($event);
            const image:any = new Image();
            const file:File = $event.target.files[0];
            const reader:FileReader = new FileReader();
            const that = this;

            if (file) {
                this.bigImg = file;
                //для задания одного формата
                this.format = this.bigImg.type.slice(6);

                if (this.bigImg.type.includes('video')) {

                    this.video = this.bigImg;

                } else {
                    this.video = null;

                    reader.onloadend = function (loadEvent:any) {
                        image.src = loadEvent.target.result;
                        that.cropper.setImage(image);
                    };

                    reader.readAsDataURL(file);
                }
            }
        }
    }

    checkImage(fileUpload) {
       this.fileUploadValid = !!fileUpload;
        console.log('valid: ' + this.fileUploadValid);
    }

    imageLoad($event) {
        console.log($event);
    }

    // формируем объект для предпросмотра
    previewForm() {

        this.bigImg = this.data.image;

        if (this.bigImg) {
            this.formPreview = {
                'img': this.bigImg,
                'title': this.form.value.header,
                'body': this.description,
                'status': 'created',
                'topNews': this.form.value.topNews,
                'private': this.form.value.private,
                'shortBody': this.form.value.textPreview,
                'confirmation': false
            };
        } else {
            this.formPreview = {
                'title': this.form.value.header,
                'body': this.description,
                'status': 'created',
                'topNews': this.form.value.topNews,
                'private': this.form.value.private,
                'shortBody': this.form.value.textPreview,
                'confirmation': false
            };
        }


        this.isValidFormSubmitted = false;
        if (this.form.invalid) {
            return;
        }
        this.isValidFormSubmitted = true;


        const modal = this.modalCtrl.create(PreviewAddArtivlePage, { 'formPreview': this.formPreview });
        modal.present();
    }


    // отправляем объект на сервер
    sendOneNews() {
        this.preloader = true;
        this.bigImg = this.data.image;
        this.smallImg = this.data.image;

        if (this.bigImg) {
            this.formPreview = {
                'fileBase64': this.bigImg,
                'fileBase64Small': this.smallImg,
                'title': this.form.value.header,
                'body': this.description,
                'shortBody': this.form.value.textPreview,
                'private': this.form.value.private,
                'status': 'created',
                'topNews': this.form.value.topNews,
                'confirmation': false
            };
        }

        if (this.video) {
            this.formPreview = {
                'video': this.video,
                'title': this.form.value.header,
                'body': this.description,
                'shortBody': this.form.value.textPreview,
                'private': this.form.value.private,
                'status': 'created',
                'topNews': this.form.value.topNews,
                'confirmation': false
            };
        }

        this.isValidFormSubmitted = false;
        if (this.form.invalid) {
            return;
        }
        this.isValidFormSubmitted = true;

        const category = this.form.value.food;

        this.articlesProvider
            .addOneNews(category, this.formPreview, this.paramsId, this.userId)
            .subscribe((res) => {
                // сброс всех полей
                this.resetParamsInForm();
                this.cacheservice.cacheMap.clear();
                this.articlesProvider.presentToastWithOptions('add')
            }, (err) => {
                console.error(err);
            });
    }
    logChange($event: any) {
        console.log($event);
    }

    ionViewDidLeave() {
        this.sub1.unsubscribe();
        this.sub2.unsubscribe();
        this.resetParamsInForm();
    }
    resetParamsInForm(){
        this.form.reset();
        this.imageChangedEvent = '';
        this.description = '';
        this.croppedImage = '';
        this.video = null;
        this.bigImg = null;
        this.fileUploadValid = false;
        this.preloader = false;
    }
}

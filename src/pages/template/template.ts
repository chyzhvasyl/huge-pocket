import {Component} from '@angular/core';
import {IonicPage} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {CategoryProvider} from "../../providers/category/category";
import {ParamsProvider} from "../../providers/params/params";
import {Categories} from "../../classes/localstorage";
import {FormControl, FormGroup, Validators, FormBuilder} from "@angular/forms";
import {ArticlesProvider} from "../../providers/articles/articles";
import  {InAppBrowser} from "@ionic-native/in-app-browser/ngx";
import { File } from '@ionic-native/file';

@IonicPage()
@Component({
    selector: 'page-template',
    templateUrl: 'template.html',
    providers: [InAppBrowser]

})
export class TemplatePage {

    sub1: Subscription;                    // подписка на получение всех параметров
    sub2: Subscription;                    // подписка на получение всех категорий
    params: any;                           // все параметры
    color: any;                            // цвет в колорпикере
    sendColor: any;                        // отправляемый цвет
    lengthBody: number;                    // длина статьи
    fontSizeBody: number;                  // размер шрифта статиь
    lengthTitle: number;                   // длина заголовка
    fontSizeTitle: number;                 // размер шрифта заголовка
    legPreviewOnMain: number;              // длина превъю
    fontPreviewOnMain: number;             // размер шрифта превъю
    input = false;                         // для отображения ввода имени категории
    newNameCategory: any;                  // имя новой категории
    save: boolean;                         // для скрытия кнопки сохранения после создания
    lifeTimeLocalStorege: any;             // количество дней токина
    categories: any;                       // категории
    preloader = false;                  // отображение прелоадера
    dateReportForm: FormGroup;
    constructor(public categoryProvider: CategoryProvider,
                public templateProvider: ParamsProvider, private fb: FormBuilder, private articleprovider: ArticlesProvider,
                private iab: InAppBrowser) {
        this.dateReportForm = fb.group({
            from: new FormControl(null, Validators.compose([Validators.required])),
            to: new FormControl(null, Validators.compose([Validators.required])),
        });

    }
    ionViewWillEnter() {
        this.sub1 = this.templateProvider
            .getParams()
            .subscribe((res) => {
                this.params = res;
                if (this.params.length === 0) {
                    this.save = false;
                } else {
                    this.save = true;
                    this.params = this.params[0];
                    this.lifeTimeLocalStorege = this.params.cookieLifeTime;
                    this.lengthTitle = this.params.articleStyles.title.length;
                    this.fontSizeTitle = this.params.articleStyles.title.fontSize;
                    this.legPreviewOnMain = this.params.articleStyles.shortBody.length;
                    this.fontPreviewOnMain = this.params.articleStyles.shortBody.fontSize;
                    this.lengthBody = this.params.articleStyles.body.length;
                    this.fontSizeBody = this.params.articleStyles.body.fontSize;
                    this.color = this.params.generalStyles.backgroundColor;
                }
            }, (err) => {
                console.error(err);
                return undefined;
            });

        this.sub2 = this.categoryProvider
            .getCategories()
            .subscribe((categories) => {
                this.categories = categories;
            }, (err) => {
                console.error(err);
            });
    }

    // параметры
    changeParams(status) {
        this.preloader = true;

        if (this.color === undefined) {
            this.sendColor = '#ffffff';
        } else {
            this.sendColor = this.color;
        }

        // редактирование параметров
        if (status === 'change') {
            const template = {
                '_id' : this.params._id,
                'cookieLifeTime': this.lifeTimeLocalStorege,
                'generalStyles' : {
                    'fontSizeMetric' : 'px',
                    'backgroundColor' : String(this.sendColor)
                },
                'articleStyles' : {
                    'shortBody': {
                        'length': this.legPreviewOnMain,
                        'fontSize': this.fontPreviewOnMain
                    },
                    'body': {
                        'length':  this.lengthBody,
                        'fontSize': this.fontSizeBody
                    },
                    'title': {
                        'length': this.lengthTitle,
                        'fontSize': this.fontSizeTitle
                    }
                }
            };

            this.templateProvider
                .changeParams(template)
                .subscribe((res) => {
                    this.preloader = false;
                }, (err) => {
                    console.error(err);
                });
        }
        //  создание параметров
        if (status === 'create' ) {
            const template = {
                'cookieLifeTime': this.lifeTimeLocalStorege,
                'generalStyles' : {
                    'fontSizeMetric' : 'px',
                    'backgroundColor' : String(this.sendColor)
                },
                'articleStyles' : {
                    'shortBody': {
                        'length': this.legPreviewOnMain,
                        'fontSize': this.fontPreviewOnMain
                    },
                    'body': {
                        'length':  this.lengthBody,
                        'fontSize': this.fontSizeBody
                    },
                    'title': {
                        'length': this.lengthTitle,
                        'fontSize': this.fontSizeTitle
                    }
                }
            };

            this.templateProvider
                .setParams(template)
                .subscribe((res) => {
                    this.save = true;
                    this.preloader = false;
                }, (err) => {
                    console.error(err);
                });
        }
    }

    // удаление категории
    deleteCategory(category) {
        this.preloader = true;
        this.categoryProvider
            .deleteOneCategory(category._id)
            .subscribe(() => {
                this.categories = this.categories.filter(c => c._id !== category._id);
                this.preloader = false;
            }, (err) => {
                console.error(err);
            });
    }

    // открытие добавления категории
    changeStatus() {
        this.input = !this.input;
    }

    // добавление категории
    addCategory() {
        this.preloader = true;
        const newCategory = {
            'name' : this.newNameCategory
        };

        this.categoryProvider
            .addNewOneCategory(newCategory)
            .subscribe((res) => {
                this.categories.unshift(res);
                this.preloader = false;
            }, (err) => {
                console.error(err);
            });
        this.newNameCategory = '';
    }
    reorderItems(indexes) {
        let element = this.categories[indexes.from];
        this.categories.splice(indexes.from, 1);
        this.categories.splice(indexes.to, 0, element);
        for(let i = 0; i < this.categories.length; i++){
            this.categories[i].order = i + 1;
        }
        this.categoryProvider.sortCategories(this.categories).subscribe((data: Categories[]) => {
        }, err => {
            console.error(err);
        });
    }
    private downloadReport(date){
        let from = date.from; //this.convertUnixTime(date.from);
        let to = date.to; //this.convertUnixTime(date.to);
        this.articleprovider.downloadReport(from, to).subscribe(file => {
                if(file.status === 204){
                    this.articleprovider.presentToastWithOptions('report');
                }else{
                    this.downloadFile(file, from, to);
                }
            },
            error =>{
                console.log('error', error)

            })
    }
    public downloadFile(data, date_from, date_to) {
        try {
            let url = this.articleprovider.api + '/report/' + date_from + '/' + date_to;
            window.open(url,'_system', 'location=yes');
        }catch (e) {
            console.error('eror', e);
            this.articleprovider.presentToastWithOptions( e);
        }
        // const blob = new Blob([data], { type: 'text/csv' });
        // const url = window.URL.createObjectURL(blob);
        // const pwa = window.open(url);
        // window.open(url, '_system', 'location=yes');
        // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        //     console.error('Please disable your Pop-up blocker and try again.');
        // }else {
        //     window.open(url, '_system', 'location=yes');
        // }
    }

    public convertUnixTime(date): number{
        return Math.round(new Date(date).getTime()/1000)
    }

    ionViewWillUnload() {
        this.sub1.unsubscribe();
        this.sub2.unsubscribe();
    }

}

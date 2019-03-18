import {Component} from "@angular/core";
import {App, Events, IonicPage, NavController, NavParams} from "ionic-angular";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ArticlesProvider} from "../../providers/articles/articles";
import {MyApp} from "../../app/app.component";
import {UserInfo} from "../../classes/localstorage";
import {ArticlePage} from "../article/article";
import {HomePage} from "../home/home";

@IonicPage()
@Component({
    selector: 'page-auth',
    templateUrl: 'auth.html',
})
export class AuthPage {

    form: FormGroup;                            // форма входа
    preloader = false;                         // отображение прелоадера
    fail = false;                             // отображение сообщения о не правильном пароле или имени
    cookie: UserInfo;
    loginUser: string;
    inputType: string = 'password';
    eyeSlash: string = 'fa fa-eye-slash';
    return: boolean;
    articleId: string;
     navCtrl(): NavController {
         return this.app.getRootNav();
     }

    constructor(
        public navParams: NavParams,
        public articlesProvider: ArticlesProvider,
        protected app: App,
        public events: Events,
        public navcontroller: NavController) {

        this.form = new FormGroup({
            username: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required)
        });
        this.return = this.navParams.get('return');
        this.articleId = this.navParams.get('articleId');

    }
    back (){
        this.navcontroller.setRoot(HomePage)
    }

    toggle(){
        this.inputType = this.inputType === 'text' ? 'password' : 'text';
        this.eyeSlash = this.eyeSlash === 'fa fa-eye' ? 'fa fa-eye-slash' : 'fa fa-eye';
    }
    // вход в приложение
    onAuthorization() {
        this.preloader = true;
        this.fail = false;
        console.log('this.form.value', this.form.value);
        this.articlesProvider
            .enterInAdmin(this.form.value)
            .subscribe((res: UserInfo) => {
                const cookie = res;
                const date = new Date().getTime();
                localStorage.setItem('forCookieValue', JSON.stringify(cookie));
                localStorage.setItem('createdDay', JSON.stringify(date));
                localStorage.setItem('userLogin', JSON.stringify(cookie.login));
                this.events.publish('user:created', 'login');
                this.preloader = false;
                if(this.return){
                    this.navCtrl().push(ArticlePage, {
                            id: this.articleId,
                        }
                    );

                }
                else {
                    this.navCtrl().setRoot(MyApp);
                }

            }, (err) => {
                this.preloader = false;
                this.fail = true;
                this.form.get('pass').reset();
            });

        // this.form.reset();
    }
    backHome() {
        if(this.return){
            this.navCtrl().push(ArticlePage, {
                    id: this.articleId,
                });
            this.return = !this.return
        }
    }
    ngOnInit(){
        this.loginUser = '' || JSON.parse(localStorage.getItem('userLogin'));

    }

}

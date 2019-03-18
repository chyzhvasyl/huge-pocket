import {Component} from '@angular/core';
import {CommentsPage} from "../comments/comments";
import {AddArticlesPage} from "../add-articles/add-articles";
import {PublicationsPage} from "../publications/publications";
import {CookieService} from "ngx-cookie-service";
import {TemplatePage} from "../template/template";

@Component({
    templateUrl: 'tabs.html',
})
export class TabsPage {

    users: any;                             // список ролей пользователя
    cookieValue: any;                       // значение куков
    tab1Root = PublicationsPage;            // маршрут
    tab2Root = AddArticlesPage;             // маршрут
    tab3Root = CommentsPage;                // маршрут
    tab4Root = TemplatePage;                // маршрут

    constructor(public cookieService: CookieService) { }

    ionViewWillEnter() {
        this.cookieValue = localStorage.getItem('forCookieValue');
        const userCookieJson = JSON.parse(this.cookieValue);
        this.users = userCookieJson.roles;
    }

    // для кого показывать кнопку отображения
    canShowAdd(): boolean {
        if (this.users) {
            return this.users.filter((x) => (x === 'CN=NEWS_Author' || x === 'CN=NEWS_Administrator')).length > 0;
        } else {
            return false;
        }
    }

    // для кого показывать кнопку отображения
    canShowTemplate(): boolean {
        if (this.users) {
            return this.users.filter((x) => (x === 'CN=NEWS_Administrator')).length > 0;
        } else {
            return false;
        }
    }
}
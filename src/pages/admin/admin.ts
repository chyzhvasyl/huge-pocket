import {Component} from '@angular/core';
import {Events, NavController, Platform} from 'ionic-angular';
import {TabsPage} from "../tabs/tabs";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {Location} from '@angular/common';
import {MyApp} from "../../app/app.component";

@Component({
    templateUrl: 'admin.html',
})
export class AdminPage {

    rootPage: any = TabsPage;           // навигация по админке

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
                public navCtrl: NavController,
                public location: Location,
                public events: Events
    ) {
        platform.ready().then(() => {
            statusBar.styleDefault();
            splashScreen.hide();
        });
    }

    // возврат на главную
    openHome() {
        this.navCtrl.setRoot(MyApp);
        console.log("11");
        this.events.publish('user:created', 'backhome');
    }
}

import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from "@angular/platform-browser";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";

import {MyApp} from "./app.component";
import {HomePage} from "../pages/home/home";
import {ListPage} from "../pages/list/list";
import {ArticlePage} from "../pages/article/article";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {RestProvider} from "../providers/rest/rest";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";

import {SafePipe} from "../pipes/safe/safe";
import {SetHtmlPipe} from "../pipes/set-html/set-html";
import {FirstCapitalLetterPipe} from "../pipes/first-capital-letter/first-capital-letter";
import {TimeAgoPipe} from "time-ago-pipe";
import {CategoryProvider} from "../providers/category/category";
import {ArticlesProvider} from "../providers/articles/articles";
import {CommentsProvider} from "../providers/comments/comments";
import {AuthPage} from "../pages/auth/auth";
import {CookieService} from "ngx-cookie-service";
import {SetVideoPipe} from "../pipes/set-video/set-video";
import {MyHttpInterceptorProvider} from "../providers/my-http-interceptor/my-http-interceptor";
import {CommentsForPublisherProvider} from "../providers/comments-for-publisher/comments-for-publisher";
import {CommentsForEditorProvider} from "../providers/comments-for-editor/comments-for-editor";
import {ParamsProvider} from '../providers/params/params';
import {SocketIoConfig, SocketIoModule} from 'ng-socket-io';
import {NotificationProvider} from '../providers/notification/notification';
import {LocalNotifications} from "@ionic-native/local-notifications";
import {conf} from "./enviroment";
import {AddArticlesPage} from "../pages/add-articles/add-articles";
import {CommentsPage} from "../pages/comments/comments";
import {PreviewAddArtivlePage} from "../pages/preview-add-artivle/preview-add-artivle";
import {AdminPage} from "../pages/admin/admin";
import {TabsPage} from "../pages/tabs/tabs";
import {MessagePubAndEditorPage} from "../pages/message-pub-and-editor/message-pub-and-editor";
import {PreviewArticlePage} from "../pages/preview-article/preview-article";
import {SetHtmlForAdminPipe} from "../pipes/set-html-for-admin/set-html-for-admin";
import {EditArticlePage} from "../pages/edit-article/edit-article";
import {TemplatePage} from "../pages/template/template";
import {ForAprovePage} from "../pages/for-aprove/for-aprove";
import {PublicationsPage} from "../pages/publications/publications";
import {QuillModule} from "ngx-quill";
import {ColorPickerModule} from "ngx-color-picker";
import {NgxPicaModule} from "ngx-pica";
import {ImageCropperModule} from "ng2-img-cropper";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {Push} from "@ionic-native/push";
import {FCM} from '@ionic-native/fcm';
import {LocalConnectionServiceProvider} from '../providers/local-connection-service/local-connection-service';
import {ImageCompressService, ResizeOptions} from "ng2-image-compress";
import {Device} from "@ionic-native/device";
import {CacheService} from "../providers/cacheService/cacheProvider";
import {cacheOperations} from "../pages/Caching/cache";

const config: SocketIoConfig = { url: conf.host + conf.port, options: {
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: Infinity
}};

export class MyHammerConfig extends HammerGestureConfig  {
    overrides = <any>{
        // override hammerjs default configuration
        pan: {
            direction: 6
        },
        pinch: {
            enable: false
        },
        rotate: {
            enable: false
        }
    }
}


@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ListPage,
        ArticlePage,
        FirstCapitalLetterPipe,
        SetHtmlPipe,
        TimeAgoPipe,
        AuthPage,
        SetVideoPipe,
        SafePipe,
        AdminPage,
        TabsPage,
        AddArticlesPage,
        PublicationsPage,
        CommentsPage,
        PreviewArticlePage,
        SetHtmlForAdminPipe,
        EditArticlePage,
        EditArticlePage,
        PreviewAddArtivlePage,
        SetHtmlForAdminPipe,
        ForAprovePage,
        MessagePubAndEditorPage,
        TemplatePage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        SocketIoModule.forRoot(config),
        IonicModule.forRoot(MyApp, {
            statusbarPadding: true,
        },{
            links: [
                { component:  HomePage, name: ' HomePage', segment: 'home' },
                { component:  AuthPage, name: ' AuthPage', segment: 'auth' },
                { component:  ListPage, name: ' ListPage', segment: 'list' },
                { component:  ArticlePage, name: ' ArticlePage', segment: 'article' },
                { component:  AdminPage, name: ' AdminPage', segment: 'admin' },
                { component:  TabsPage, name: ' TabsPage', segment: 'tabs' },
                { component:  AddArticlesPage, name: ' AddArticlesPage', segment: 'add-article' },
                { component:  PublicationsPage, name: ' PublicationsPage', segment: 'publication' },
                { component:  CommentsPage, name: ' CommentsPage', segment: 'comments' },
                { component:  PreviewArticlePage, name: ' PreviewArticlePage', segment: 'preview-article' },
                { component:  EditArticlePage, name: ' EditArticlePage', segment: 'edit-article' },
                { component:  PreviewAddArtivlePage, name: ' PreviewAddArtivlePage', segment: 'preview-add-article' },
                { component:  ForAprovePage, name: ' ForAprovePage', segment: 'for-aprove' },
                { component:  MessagePubAndEditorPage, name: ' MessagePubAndEditorPage', segment: 'message-pub-and-editor' },
                { component:  TemplatePage, name: ' TemplatePage', segment: 'template' }
            ]
        }),
        NgxPicaModule,
        ImageCropperModule,
        QuillModule,
        ColorPickerModule,
        BrowserAnimationsModule

    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ListPage,
        ArticlePage,
        AuthPage,
        AdminPage,
        TabsPage,
        AddArticlesPage,
        PublicationsPage,
        CommentsPage,
        PreviewArticlePage,
        EditArticlePage,
        PreviewAddArtivlePage,
        ForAprovePage,
        MessagePubAndEditorPage,
        TemplatePage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        CacheService,

        {provide: cacheOperations, useClass: CacheService},
        {
            provide: ErrorHandler,
            useClass: IonicErrorHandler
        },
        RestProvider,
        CategoryProvider,
        ArticlesProvider,
        CommentsProvider,
        {
            provide: HTTP_INTERCEPTORS,
            useClass:  MyHttpInterceptorProvider,
            multi: true
        },
        CookieService,
        CommentsForPublisherProvider,
        CommentsForEditorProvider,
        ParamsProvider,
        NotificationProvider,
        LocalNotifications,
        Push,
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: MyHammerConfig
        },
        LocalConnectionServiceProvider,
        FCM,
        ImageCompressService,
        ResizeOptions,
        Device
    ]
})
export class AppModule {}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Socket} from "ng-socket-io";
import {LocalNotifications} from "@ionic-native/local-notifications";
import {Events} from "ionic-angular";

@Injectable()
export class LocalConnectionServiceProvider {

  connectedSocket: any;

  constructor(public http: HttpClient,
              public socket: Socket,
              public localNotifications: LocalNotifications,
              public events: Events) {
    console.log('Hello LocalConnectionServiceProvider Provider');
    //
    // if (!this.connectedSocket){
    //   this.connectedSocket = socket.connect();
    // }

  }

  init(userCookieJson) {
    if (!this.connectedSocket || this.connectedSocket.disconnected){
      console.log('Init LocalConnectionServiceProvider Provider');
      this.connectedSocket = this.socket.connect();
      this.connectedSocket.emit('login', userCookieJson);
      this.connectedSocket.on('update', this.updateCallback(
          this.localNotifications,
          this.events,
          userCookieJson.roles,
          'notice'
      ));
      this.connectedSocket.on('video', this.updateCallback(
          this.localNotifications, this.events, userCookieJson.roles, 'video'));

      this.connectedSocket.on('reconnect', (attemptNumber) => {
        console.log('reconnect --------- ddddddddddddddddd');
        this.connectedSocket.emit('login', userCookieJson);
      });
    }
    return this.connectedSocket;
  }
  breakConnect(){
    console.log('breakConnect socket');
    this.socket.disconnect();
    this.socket.removeAllListeners();
  }

  private updateCallback(localNotifications, events, users, eventName) {
    return function(notice) {
      console.log('notice eventName---------------', eventName);
      console.log('notice notice---------------', notice);

      if (notice.status === 'created') {

        localNotifications.schedule({
          text: 'У Вас появилась новость требующая проверки',
          lockscreen: true,
          launch: true,
          skipPermission: true,
          foreground: true,
          vibrate: true,
        });

        console.log("5");
        events.publish('user:created', notice);

        // this.scheduleNotification('У Вас появилась новость требующая проверки');

      } else if (notice.status === 'modified'){
        localNotifications.schedule({
          text: 'У Вас появилась новость требующая проверки',
          lockscreen: true,
          launch: true,
          skipPermission: true,
          foreground: true,
          vibrate: true,
        });

        console.log("6");
        events.publish('user:created', notice);

        // this.scheduleNotification('У Вас появилась новость требующая проверки');

      } else if (notice.status === 'published') {

        if ( users.filter((x) => (x === 'CN=NEWS_Author')).length > 0) {
          localNotifications.schedule({
            text: 'Ваша статья опубликована',
            lockscreen: true,
            launch: true,
            skipPermission: true,
            foreground: true,
            vibrate: true,
          });

          console.log("7");
          events.publish('user:created', notice);
          // this.scheduleNotification('Ваша статья опубликована');

        } else {
          localNotifications.schedule({
            text: 'Опубликована новая новость',
            lockscreen: true,
            launch: true,
            skipPermission: true,
            foreground: true,
            vibrate: true,
          });


          console.log("8");
          events.publish('user:created', notice);
          // this.scheduleNotification('Опубликована новая новость');
        }

      } else if (notice.status === 'not approved by publisher' || notice.status === 'not approved by editor') {
        localNotifications.schedule({
          text: 'Ваша новость не утверждена, необходимо редактирование',
          lockscreen: true,
          launch: true,
          skipPermission: true,
          foreground: true,
          vibrate: true,
        });

        console.log("9");
        events.publish('user:created', notice);
        // this.scheduleNotification('Ваша новость не утверждена, необходимо редактирование');
      } else if (notice === 'Video converted') {
        localNotifications.schedule({
          text: 'Видео на Вашей статье завершило обработку',
          lockscreen: true,
          launch: true,
          skipPermission: true,
          foreground: true,
          vibrate: true,
        });

        console.log("10");
        events.publish('user:created', notice);
      }
    };
  }

}

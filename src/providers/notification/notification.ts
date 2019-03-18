import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Socket} from "ng-socket-io";
import {Observable} from "rxjs/Observable";

@Injectable()
export class NotificationProvider {

    constructor(public http: HttpClient,
                private socket: Socket) {

    }

    sendMessage(eventName, user) {
        this.socket.emit(`${eventName}`, { user });
    }


    getMessages(ection) {
        let observable = new Observable(observer => {
            this.socket.on(`${ection}`, (data) => {
                observer.next(data);
            });
        });
        return observable;
    }
}

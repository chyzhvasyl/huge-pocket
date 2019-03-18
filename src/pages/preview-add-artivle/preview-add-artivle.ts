import {Component} from "@angular/core";
import {IonicPage, NavParams, ViewController} from "ionic-angular";

@IonicPage()
@Component({
    selector: 'page-preview-add-artivle',
    templateUrl: 'preview-add-artivle.html',
})
export class PreviewAddArtivlePage {

    preview: any;                   // статья для добаление

    constructor(public navParams: NavParams,
                public viewCtrl: ViewController) {
        this.preview = navParams.get('formPreview');
    }

    // возврат к добавлению статьи
    dismiss() {
        this.viewCtrl.dismiss();
    }
}

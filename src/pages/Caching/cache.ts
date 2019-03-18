import { HttpRequest, HttpResponse } from '@angular/common/http';
import {Constants} from "../../classes/constants";

export abstract class cacheOperations {
    abstract get(req: HttpRequest<any>): HttpResponse<any> | null;
    abstract put(req: HttpRequest<any>, res: HttpResponse<any>): void;
}

export interface cachedObject {
    url: string;
    response: HttpResponse<any>
    entryTime: number;
}

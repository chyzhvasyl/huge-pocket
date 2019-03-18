import { Injectable } from '@angular/core';
import {HttpRequest, HttpResponse} from "@angular/common/http";
import {cacheOperations} from "../../pages/Caching/cache";
import {cachedObject} from "../../pages/Caching/cache";
import {Constants} from "../../classes/constants";

@Injectable()
export class CacheService implements cacheOperations{
    cacheMap = new Map<string, cachedObject>();
    get(req: HttpRequest<any>): HttpResponse<any> | null {
        const entry = this.cacheMap.get(req.urlWithParams);
        if (!entry) {
            return null;
        }
        const isExpired = (Date.now() - entry.entryTime) > Constants.MAX_CACHE_AGE;
        return isExpired ? null : entry.response;
    }
    put(req: HttpRequest<any>, res: HttpResponse<any>): void {
        const entry: cachedObject = { url: req.urlWithParams, response: res, entryTime: Date.now() };
        this.cacheMap.set(req.urlWithParams, entry);
        this.deleteExpiredCache();
    }
    private deleteExpiredCache() {
        this.cacheMap.forEach(entry => {
            if ((Date.now() - entry.entryTime) >  Constants.MAX_CACHE_AGE) {
                this.cacheMap.delete(entry.url);
            }
        })
    }
}

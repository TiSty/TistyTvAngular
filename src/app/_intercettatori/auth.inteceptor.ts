import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest, HttpInterceptor, HttpHeaders, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../_servizi/auth.service';


@Injectable({
    providedIn: 'root'
})
export class AuthIntercept implements HttpInterceptor {

    constructor(private auth: AuthService) { }

    //---------------------------------------------------------------------------------------------------------------
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // let richiestaModificata = req.clone({
        //     headers: new HttpHeaders().set("Language", AppConfigService.auth.idLingua.toString())
        // });
        let richiestaModificata = req;
        // const utenteToken = AppConfigService.auth.tk;

        let tmp = this.auth.leggiAuthDaLocalStorage();
        let utenteToken = tmp.token
        console.log("INTERCEPTOR", tmp)
        if (utenteToken !== null) {
            richiestaModificata = req.clone({
                headers: new HttpHeaders().set("Authorization", `Bearer ${utenteToken}`)
                // headers: new HttpHeaders().set("Authorization", "Basic " + btoa("0:" + utenteToken))
            });
        }

        return next.handle(richiestaModificata)
    }
    //---------------------------------------------------------------------------------------------------------------
}
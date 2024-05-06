import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { auto } from "@popperjs/core";
import { Observable } from "rxjs";
import { AuthService } from "./_servizi/auth.service";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate {

    constructor(private auth:AuthService, private router:Router){}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if (this.auth.isAbilitato()===true) {
            return true
        }
        return this.router.parseUrl('/accedi');
    }
}

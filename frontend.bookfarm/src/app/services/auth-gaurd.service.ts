import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthService } from './user-auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGaurd implements CanActivate{

  constructor(private userSevice : UserAuthService,private router : Router,private cookie : CookieService) { }

  canActivate(rout : ActivatedRouteSnapshot,
              state : RouterStateSnapshot) : Promise<boolean> | Observable<boolean> | boolean{

        if(!this.userSevice.get_auth_status()){
           if(this.cookie.get('token')){
              this.userSevice.authenticate();
              return true;
           }
           else{
              alert('You are not Logged in');
              this.router.navigate(['/login']);
              return false;
           }
        }
        else{
          return true;
        }
   }
}

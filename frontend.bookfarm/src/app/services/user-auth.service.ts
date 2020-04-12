import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { promise } from 'protractor';
import { resolve } from 'url';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private api = 'https://bookfarm.herokuapp.com';
  error = new Subject<HttpErrorResponse>();

  isLoggedIn = new Subject<boolean>();

  private isAuthenticated = false;

  constructor(private http: HttpClient,private cookieService : CookieService,private router : Router) { }

  login(postData:{ email:string , password : string}){
      this.http.post(this.api+'/auth/login',postData)
      .subscribe(
        (response:{id,first_name,last_name,email,auth_token}) => {
            let promise = new Promise(
              (resolve,reject) => {
                this.isAuthenticated = true;
                this.isLoggedIn.next(this.get_auth_status());

                this.cookieService.set('token',response.auth_token);
                this.cookieService.set('name',response.first_name);
                this.cookieService.set('id',response.id);       

                resolve();
              }
            )

            promise.then(
              () => {
                this.router.navigate(['/trades']);
              }
            )
        },
        (error) => {
            this.error.next(error);
        }
      )
  }

  logout(){
    let postData = {};
    this.http.post(this.api+'/auth/logout',postData,
    {
      headers:{
        'Authorization':'token '+this.cookieService.get('token')
      }
    })
    .subscribe(
      (response) => {
        this.isAuthenticated = false;
        this.isLoggedIn.next(this.get_auth_status());
        this.cookieService.deleteAll();
        this.router.navigate(['/login']);
      }
    )
  }

  register(postData:{ email:string , password:string, first_name:string, last_name:string}){
    this.http.post(this.api+'/auth/register',postData)
    .subscribe(
      (response:{id,first_name,last_name,email,auth_token}) => {
        let promise = new Promise(
          (resolve,reject) => {
            this.isAuthenticated = true;
            this.isLoggedIn.next(this.get_auth_status());

            this.cookieService.set('token',response.auth_token);
            this.cookieService.set('name',response.first_name);
            this.cookieService.set('id',response.id);       

            resolve();
          }
        )

        promise.then(
          () => {
            this.router.navigate(['/trades']);
          }
        )


      },
      (error) => {
          this.error.next(error);
          console.log(error);
          
      }
    )
  }

  get_auth_status(){
    return this.isAuthenticated;
  }

  fetchUserById(id){
    
    return this.http.get(this.api+'/users/'+id,
    {
      headers:{
        'Authorization':'token '+this.cookieService.get('token')
      }
    })
  }

  authenticate(){
    this.isAuthenticated = true;
    this.isLoggedIn.next(this.get_auth_status());
  }

}

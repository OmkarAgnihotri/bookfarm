import { Component, OnInit, OnChanges } from '@angular/core';
import { UserAuthService } from './services/user-auth.service';
import { CookieService } from 'ngx-cookie-service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'bookfarm';
  
  loggedIn = false;

  constructor(private userService : UserAuthService,private cookie : CookieService){}

  ngOnInit(){

    this.loggedIn = this.userService.get_auth_status();    
    
    this.userService.isLoggedIn.subscribe(
      (status) => {
        this.loggedIn = status;
      }
    );
  }
 

  // setCurrentUser(){
  //   this.userService.fetchUserById(+this.cookie.get['id'])
  //   .subscribe(
  //     (user) => {
  //         this.user = user
  //     }
  //   )
  // }
}

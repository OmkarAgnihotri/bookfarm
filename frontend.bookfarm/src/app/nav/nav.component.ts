import { Component, OnInit, ViewChild } from '@angular/core';
import { UserAuthService } from '../services/user-auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  username = ''
  userID:number;
  displayDropDown = false;
  constructor(private userService : UserAuthService,private cookie : CookieService){}

  ngOnInit() {
    this.username = this.cookie.get('name');
    this.userID = +this.cookie.get('id')
  }

  toggleNavbar(){
    this.displayDropDown = !this.displayDropDown;
  }
  
  logout(){
    if(confirm('Are you sure you want ot logout ? ')){
      this.userService.logout();
    }
        
  }

}

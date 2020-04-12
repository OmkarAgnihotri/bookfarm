import { Component, OnInit } from '@angular/core';
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
  constructor(private userService : UserAuthService,private cookie : CookieService){}

  ngOnInit() {
    this.username = this.cookie.get('name');
    this.userID = +this.cookie.get('id')
  }
  
  logout(){
    if(confirm('Are you sure you want ot logout ? ')){
      this.userService.logout();
    }
        
  }

}

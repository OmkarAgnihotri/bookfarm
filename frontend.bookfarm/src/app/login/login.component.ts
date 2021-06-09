import { Component, OnInit } from '@angular/core';
import { UserAuthService } from '../services/user-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  error_message = null;

  constructor(private userService : UserAuthService,
              private router : Router) { }

  ngOnInit() {

    this.userService.error.subscribe(
        (error) => {
          this.error_message = error.error.message;
        }
    )
  }


  onSubmit(form){
    this.userService.login({email:form.value.email,password:form.value.password});
  }
}

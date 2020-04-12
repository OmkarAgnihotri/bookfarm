import { Component, OnInit } from '@angular/core';
import { UserAuthService } from '../services/user-auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  error_message = null;
  constructor(private userService:UserAuthService) { }

  ngOnInit() {
    this.userService.error.subscribe(
      (error) => {
        this.error_message = error.error.message;
        console.log(this.error_message);
        
      }
    )

    
  }

  onSubmit(form){
    this.userService.register(form.value);
  }

}

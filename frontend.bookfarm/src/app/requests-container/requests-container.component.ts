import { Component, OnInit } from '@angular/core';
import { Book, User, RequestedBook } from '../requests/requests.component';
import { Route } from '@angular/compiler/src/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-requests-container',
  templateUrl: './requests-container.component.html',
  styleUrls: ['./requests-container.component.css']
})
export class RequestsContainerComponent implements OnInit {

  constructor(private router : Router,private route : ActivatedRoute) { }

  ngOnInit() {
    this.router.navigate(['sent'],{
      relativeTo:this.route
    })
  }
  
}

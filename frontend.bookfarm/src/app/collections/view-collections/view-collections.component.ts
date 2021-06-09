import { Component, OnInit } from '@angular/core';
import { BooksService } from 'src/app/services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Book } from 'src/app/requests/requests.component';



@Component({
  selector: 'app-view-collections',
  templateUrl: './view-collections.component.html',
  styleUrls: ['./view-collections.component.css']
})

export class ViewCollectionsComponent implements OnInit {
  searchstr = ''
  collection:Book[]=[]
  userID:number;
  loggedInUser:number
  toggle:boolean[] = new Array(100);
  constructor(private booksService : BooksService, private cookie : CookieService,
              private route : ActivatedRoute) { }

  ngOnInit() {
    this.userID = +this.route.snapshot.params['userID'];
    this.loggedInUser = +this.cookie.get('id');
    this.booksService.fetchCollection(this.userID,this.searchstr)
    .subscribe(
      (books:Book[]) => {
          this.collection = books
      }
    )
  }

  fetchCollection(event:Event){
    this.searchstr = (<HTMLInputElement>event.target).value;

    this.booksService.fetchCollection(this.userID,this.searchstr)
    .subscribe(
      (books:Book[]) => {
          this.collection = books
      }
    )

  }

  addToCart(bookID,index){
    let user1 = +this.cookie.get('id');
    let user2 = this.route.snapshot.params['userID'];

    this.booksService.addToCart(user1,user2,bookID)
    .then(
      (response) => {
        this.toggle[index] = true;
        console.log(response);
        
      }
    )
  }

}

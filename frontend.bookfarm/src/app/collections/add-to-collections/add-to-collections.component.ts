import { Component, OnInit } from '@angular/core';
import { BooksService } from 'src/app/services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { Book } from 'src/app/requests/requests.component';


@Component({
  selector: 'app-add-to-collections',
  templateUrl: './add-to-collections.component.html',
  styleUrls: ['./add-to-collections.component.css']
})
export class AddToCollectionsComponent implements OnInit {
  isLoading:boolean = false;
  toggle:boolean[]=new Array(1000);
  collection:Book[]=[]
  user:number;
  constructor(private booksService : BooksService, private cookie : CookieService) { }

  ngOnInit() {
    this.user = +this.cookie.get('id');
    for (let index = 0; index < this.toggle.length; index++) {
      this.toggle[index] = false;
      
    }
  }

  fetchCollection(searchstr){
    this.isLoading = true;
    for (let index = 0; index < this.toggle.length; index++) {
      this.toggle[index]=false;
      
    }
    this.booksService.searchBooks(+this.cookie.get('id'),searchstr)
    .subscribe(
      (books:Book[]) => {
          this.collection = books
          this.isLoading = false;
      }
    )

  }

  addToCollection(bookId,index){
    this.toggle[index] = true;
    console.log(bookId)
    this.booksService.addToCollection(+bookId,+this.cookie.get('id'))
    .then(
      (response) => {
      
      }
    )
  }

}

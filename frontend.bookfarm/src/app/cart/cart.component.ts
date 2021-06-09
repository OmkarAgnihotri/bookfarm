import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { User, Book } from '../requests/requests.component';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  isLoading = true;
  result = []
  toggle:boolean[] = new Array(100);
  requested:boolean[] = new Array(100);
  constructor(private booksService : BooksService, private cookie : CookieService) { }

  ngOnInit() {
    this.init();
    
  }

  async init(){
    
    let user = +this.cookie.get('id')
    let response:{user:number,books:number[]}[] = <{user:number,books:number[]}[]>await this.booksService.getCartItems(user);
    
    for (let index = 0; index < response.length; index++) {

      const item = response[index];
      
      let user = <User>await this.booksService.getUserById(item.user)
      
      let books:Book[]=[];

      // for (let index = 0; index < item.books.length; index++) {
      //   const bookID = item.books[index];

      //   let book = <Book>await this.booksService.getBookById(bookID);
        
      //     books.push(book);  
      // }

      this.getBooks(item.books)
      .subscribe(
        (bookList:Book[]) => {
            for (let index = 0; index < bookList.length; index++) {
              const book = bookList[index];
              books.push(book);
            }

            this.result.push({
              user:user,
              books:books
            });
        }
      )

      
    }

    this.isLoading = false
  }

  getBooks(bookList:number[]){
    let books:Observable<any>[]=[];

    for (let index = 0; index < bookList.length; index++) {
      const id = bookList[index];
      books.push(this.booksService.getBookById(+id))
    }

    return forkJoin(books);
  }

  async sendRequest(books:Book[],user2,index){
    let user1 = +this.cookie.get('id');
    const request:{id,user1,user2,when}[] = <any[]>await this.booksService.fetchRequestID(user2,user1)  //if this request is a response to prior received request
    console.log(books,user1,user2,request);
    
    if(request.length > 0){
      const id = request[0].id;
      const response = await this.booksService.setResponseBooks(books,id)
      console.log(books,user1,user2,request);
      
    }
    else{
      const request:any[] = <any[]>await this.booksService.fetchRequestID(user1,user2)
      console.log(books,user1,user2,request);
        if(request.length > 0){
          const response = await this.booksService.addToRequestedBooks(books,request[0].id)

        }
        else{

            this.booksService.requestBooksForFirstTime(user1,user2,books)
        }
    }

    this.booksService.deleteCartItems(user1,user2)
    .then(
      (response) => {
        this.requested[index] = true;
      }
    );

    
    
  }

}

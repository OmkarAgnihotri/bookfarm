import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { Book, User } from '../requests/requests.component';

export class Collection{
  id?:number;
  user?:number;
  book?:number;
  available?:boolean;
}

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit {
  isLoading = true
  searchstr='';

  disabled=true
  spin=true

  toggle:boolean[] = new Array(100);

  constructor(private booksService : BooksService,private cookie : CookieService) { }
  collection:{
    user?:User
    book?:Book;
  }[]=[]
  all:{
    user?:User
    book?:Book;
  }[]=[]
  ngOnInit() {
    
    this.booksService.fetchAvailableBooks(this.searchstr)
    .toPromise()
    .then(
      (collection:Collection[]) => {
          this.init(collection);
         
      }
    )
  }

  fetchCollection(event:Event){
    

    // this.booksService.fetchAvailableBooks(this.searchstr)
    // .toPromise()
    // .then(
    //   (collection:Collection[]) => {
       
    //       this.init(collection);
    //   }
    // )
    
    let temp = this.all.filter((item)=>{
     
      return item.book.title.toLowerCase().includes(this.searchstr.toLowerCase()) || item.book.author.toLowerCase().includes(this.searchstr.toLowerCase())
    })
    
    
    this.collection = temp

  }

  async init(collection:Collection[]){
    this.isLoading = true
    let temp:{
      user?:User
      book?:Book;
    }[]=[]

    for (let index = 0; index < collection.length; index++) {
      const item = collection[index];

      let user:User = <User>await this.booksService.getUserById(+item.user)
        

      

      let book:Book = <Book>await this.booksService.getBookById(+item.book)
        
      temp.push({
        user:user,
        book:book
      })
    }

    this.isLoading = false
    this.collection=temp
    this.all = this.collection
    this.disabled = false;
    this.spin = false
  }

  addToCart(user2,book,index){
    let user1 = +this.cookie.get('id');
    this.booksService.addToCart(user1,user2,book)
    .then(
      (response) => {
        this.toggle[index] = true;
        console.log(response);
        
      }
    )

  }

  refresh(){
    this.searchstr=''
    this.spin=true
    this.disabled = true
    this.isLoading = true
    this.booksService.fetchAvailableBooks(this.searchstr)
    .toPromise()
    .then(
      (collection:Collection[]) => {
          this.init(collection);
         
      }
    )
  }
  
}

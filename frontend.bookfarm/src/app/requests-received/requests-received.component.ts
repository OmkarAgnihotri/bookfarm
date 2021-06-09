import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { Book, User, RequestedBook,Request, ConfirmationStatus } from '../requests/requests.component';
import { Observable, forkJoin } from 'rxjs';
import { resolve } from 'url';


@Component({
  selector: 'app-requests-received',
  templateUrl: './requests-received.component.html',
  styleUrls: ['./requests-received.component.css']
})
export class RequestsReceivedComponent implements OnInit {
  isLoading = true;
  toggle:boolean[]=new Array(1000);
  requested:boolean[]=new Array(1000);
  constructor(private booksService : BooksService,private cookie:CookieService) { }
  result:{
    user;
    requestID:number;
    books1:Book[];
    books2:Book[];
    approved_books1:Book[];
    approved_books2:Book[];
    confirmationStatus?:ConfirmationStatus;

  }[]=[];
  ngOnInit() {
    this.init()
    
  }
  async init(){

        

    const response:Request[] = <any[]>await this.booksService.fetchReceivedRequests(+this.cookie.get('id'))
    
    
    for (let index = 0; index < response.length; index++) {
      let books1:Book[]=[];
      let books2:Book[]=[];
      let approved_books1:Book[]=[];
      let approved_books2:Book[]=[];

      const requestObj = response[index];
      
      let user:User = <User>await this.booksService.getUserById(+requestObj.user)
      
      let books:Book[] = <Book[]>await this.getBooks(requestObj.requested_books)

        for (let index = 0; index < books.length; index++) {
          const book = books[index];
          if(requestObj.requested_books[index].isApproved === true)
            approved_books1.push(book)

          books1.push(book);
      }
        

    let requested_books:RequestedBook[] = <RequestedBook[]>await this.booksService.fetchResponse(+requestObj.request_id)
    
    books = <Book[]>await this.getBooks(requested_books)
     
      for (let index = 0; index < books.length; index++) {
        const book = books[index];
        if(requested_books[index].isApproved === true)
          approved_books2.push(book)

        books2.push(book);
      }

   
    const confirmationStatus:ConfirmationStatus = <ConfirmationStatus>await this.booksService.getConfirmationStatus(+requestObj.request_id);
    

          this.result.push({
            user:user,
            requestID:+requestObj.request_id,
            books1:books1,
            books2:books2,
            approved_books1:approved_books1,
            approved_books2:approved_books2,
            confirmationStatus:confirmationStatus
          });

          
          
    }
    this.isLoading = false;
  }
    
  getBooks(bookList:RequestedBook[]){
    if(bookList.length === 0)
      return new Promise((resolve,reject) => { resolve([])})
    let books:Observable<any>[]=[];

    for (let index = 0; index < bookList.length; index++) {
      const item = bookList[index];
      books.push(this.booksService.getBookById(+item.book))
    }

    return forkJoin(books).toPromise();
  }


showDetails(id){

  this.toggle[id]=!this.toggle[id];
}
onApprove(bookID,requestID,index,bookIndex){
    
    
  this.booksService.approve(bookID,requestID).then(
    (response) => {
      this.result[index].approved_books1.push(this.result[index].books1[bookIndex]);
      this.result[index].books1[bookIndex].isApproved = true;
    }
  )
}

async onConfirm(requestID,confirmationStatus:ConfirmationStatus,approved_books2,approved_books1,index){

  if(confirmationStatus.user1HasConfirmed === true){
    alert('Are you sure you want to proceed?')
    this.booksService.makeTrade(confirmationStatus.user1,confirmationStatus.user2,approved_books2,approved_books1)

    const res = await this.booksService.deleteRequest(requestID)

    alert('Congratulations! Enjoy your books')

    this.requested[index] = true
  }
  else{
    this.booksService.changeConfirmationStatus(requestID,false,true).then(
      (response)=>{
        this.result[index].confirmationStatus.user2HasConfirmed = true
      }
    )
  }
}

  
}

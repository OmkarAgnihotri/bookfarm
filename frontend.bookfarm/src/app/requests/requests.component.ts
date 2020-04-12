import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { fas } from '@fortawesome/free-solid-svg-icons';

export class Request{
    request_id?:number;
    user?:number;
    when?:string;
    requested_books?:RequestedBook[];
    
};

export class ConfirmationStatus{
  request?:number;
  user1?:number;
  user2?:number;
  user1HasConfirmed:boolean;
  user2HasConfirmed:boolean;
}

export class RequestedBook{
 
  request?:number;
  book?:number;
  isApproved?:boolean;

};
export class User{
  id?:string;
  email?:string;
  first_name?:string;
  last_name?:string;
}
export class Book{
  id?:number;
  title:string;
  author:string;
  img_src:string;
  isApproved?:boolean;
}
@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
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

        

      const response:Request[] = <any[]>await this.booksService.fetchSentRequests(+this.cookie.get('id'))
      
      
      for (let index = 0; index < response.length; index++) {
        let books1:Book[]=[];
        let books2:Book[]=[];
        let approved_books1:Book[]=[];
        let approved_books2:Book[]=[];

        const requestObj = response[index];
        
        
        let user:User = <User>await this.booksService.getUserById(+requestObj.user)
                  
        for (let index = 0; index < requestObj.requested_books.length; index++) {

            const item = requestObj.requested_books[index];

            let book:Book = <Book>await this.booksService.getBookById(+item.book)

            

            if(item.isApproved === true){
              approved_books1.push(book)
            }
            books1.push(book)
        }

       
        
      let requested_books:RequestedBook[] = <RequestedBook[]>await this.booksService.fetchResponse(+requestObj.request_id)
            
      for (let index = 0; index < requested_books.length; index++) {

        const item = requested_books[index];
       
        let book:Book = <Book>await this.booksService.getBookById(+item.book)
        book.isApproved = item.isApproved
        if(item.isApproved === true){
          approved_books2.push(book)
        }
        books2.push(book)
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
      
  

  showDetails(id){
 
    this.toggle[id]=!this.toggle[id];
  }

  onApprove(bookID,requestID,index,bookIndex){
    
    
    this.booksService.approveResponseBook(bookID,requestID).then(
      (response) => {
        this.result[index].approved_books2.push(this.result[index].books2[bookIndex]);
        this.result[index].books2[bookIndex].isApproved = true;
      }
    )
  }

  async onConfirm(requestID,confirmationStatus:ConfirmationStatus,approved_books2,approved_books1,index){

    if(confirmationStatus.user2HasConfirmed === true){
      alert('Are you sure you want to proceed?')
      const response = await this.booksService.makeTrade(confirmationStatus.user1,confirmationStatus.user2,approved_books2,approved_books1)

      const res = await this.booksService.deleteRequest(requestID)

      alert('Congratulations! Enjoy your books')

      this.requested[index] = true
    }
    else{
      this.booksService.changeConfirmationStatus(requestID,true,false).then(
        (response)=>{
          this.result[index].confirmationStatus.user1HasConfirmed = true
        }
      )
    }
  }

}

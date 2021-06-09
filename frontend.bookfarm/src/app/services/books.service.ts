import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import {  map } from "rxjs/operators";
import { ActivatedRoute } from '@angular/router';
import { Book } from '../requests/requests.component';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private apiDomain = 'https://bookfarm.herokuapp.com';

  // private apiDomain = ' http://127.0.0.1:8000';
  
  constructor(private http : HttpClient,private cookie : CookieService,
              private route : ActivatedRoute) { }

  fetchCollection(id:Number,searchstr:string=''){
      return this.http.get(this.apiDomain+'/collection/'+id+'?searchstr='+searchstr,
          {
              headers:new HttpHeaders({
                'Authorization':'token '+this.cookie.get('token')
              })
          }
      );
  }

  fetchTrades(id:Number){
    return this.http.get(this.apiDomain+'/trades/'+id,
                  {
                      headers: new HttpHeaders({
                        'Authorization':'token '+this.cookie.get('token')
                      })
                  });
  }

  searchBooks(id,searchstr){
    return this.http.get(this.apiDomain+'/books'+'?user='+id+'&searchstr='+searchstr,
          {
              headers:new HttpHeaders({
                'Authorization':'token '+this.cookie.get('token')
              })
          }
      );
  }

  fetchBooksList(trade,user){
    
    return this.http.get(this.apiDomain+'/tradeDetails/'+trade+'?user='+user,
      {
        headers: new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
      }
    )
   
  }

  fetchSentRequests(user){
    return this.http.get(this.apiDomain+'/requests/sent?user='+user,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    .toPromise()
  }

  fetchReceivedRequests(user){
    return this.http.get(this.apiDomain+'/requests/received?user='+user,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    .toPromise()
  }

  getBookById(bookId){
    return this.http.get(this.apiDomain+'/books/'+bookId,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    
  }

  addToRequestedBooks(books,request){
    let postData = []
    for (let index = 0; index < books.length; index++) {
      const book = books[index];
      postData.push({
        request:request,
        book:book.id
      });
    }
    return this.http.post(this.apiDomain+'/requests/'+request+'/requested_books',postData,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    .toPromise()
  }

  async requestBooksForFirstTime(user1,user2,books){

    let requestData = {
      user1:user1,
      user2:user2
    }

    const request:{id,user1,user2,when} = <{id,user1,user2,when}>await this.http.post(this.apiDomain+'/requests',requestData,{
            headers:new HttpHeaders({
              'Authorization':'token '+this.cookie.get('token')
            })
          })
          .toPromise()

    let postData =[];

    for (let index = 0; index < books.length; index++) {
      const book = books[index];
      postData.push({
        request:request.id,
        book:book.id
      });
    }

    
    
    const response = await this.http.post(this.apiDomain+'/requests/'+request.id+'/requested_books',postData,{
          headers:new HttpHeaders({
            'Authorization':'token '+this.cookie.get('token')
          })
        })
        .toPromise()

    this.setConfirmationStatus(request.id,user1,user2).then(
      (response) =>{

      }
    )

  }

  setResponseBooks(books:Book[],request){
    let postData = []
    for (let index = 0; index < books.length; index++) {
      const book = books[index];
      postData.push({
        request:request,
        book:book.id
      });
    }
    return this.http.post(this.apiDomain+'/requests/'+request+'/response/books',postData,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    .toPromise()
  }



  getUserById(id:number){
    return this.http.get(this.apiDomain+'/users/'+id,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    .toPromise()
    
  }

  fetchResponse(request){
    return this.http.get(this.apiDomain+'/requests/'+request+'/response',{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    .toPromise()
  }

  addToCollection(bookID,userID){
    
    let postData={
      user:userID,
      book:bookID
    };
    return this.http.post(this.apiDomain+'/collection',postData,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    })
    .toPromise()
  }

  fetchAvailableBooks(searchstr){
    let user = +this.cookie.get('id');
        return this.http.get(this.apiDomain+'/collection?searchstr='+searchstr+'&user='+user,
        {
            headers:new HttpHeaders({
              'Authorization':'token '+this.cookie.get('token')
            })
        }
        );
  }

  fetchRequestID(user1,user2){
    return this.http.get(this.apiDomain+'/requests?user1='+user1+'&user2='+user2,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();
  }

  addToCart(user1,user2,book){
    let postData = {
      user1:user1,
      user2:user2,
      book:book
    }
    return this.http.post(this.apiDomain+'/cart',postData,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();
  }


  getCartItems(user:number){
    return this.http.get(this.apiDomain+'/cart/'+user,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();
  }

  deleteCartItems(user1,user2){
    return this.http.delete(this.apiDomain+'/cart/'+user1+'?user2='+user2,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();
  }

  approve(book,request){
    const data = {
      isApproved : true
    }

    return this.http.patch(this.apiDomain+'/requests/'+request+'?book='+book,data,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();

  }

  approveResponseBook(book,request){
    const data = {
      isApproved : true
    }

    return this.http.patch(this.apiDomain+'/requests/'+request+'/response/approve?book='+book,data,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();

  }

  setConfirmationStatus(requestID,user1,user2){
    const body = {
      request:requestID,
      user1:user1,
      user2:user2
    }
    return this.http.post(this.apiDomain+'/confirmation',body,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();
  }

  getConfirmationStatus(requestID){
    return this.http.get(this.apiDomain+'/confirmation/'+requestID,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();
  }

  changeConfirmationStatus(requestID,status1,status2){
    const body = {
      user1HasConfirmed:status1,
      user2HasConfirmed:status2
    }
    return this.http.patch(this.apiDomain+'/confirmation/'+requestID,body,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();

  }

  
  deleteConfirmationStatus(requestID){
    return this.http.delete(this.apiDomain+'/confirmation/'+requestID,
    {
        headers:new HttpHeaders({
          'Authorization':'token '+this.cookie.get('token')
        })
    }
    )
    .toPromise();
  }

  async makeTrade(user1,user2,books1:Book[],books2:Book[]){
    const data = {
      user1:user1,
      user2:user2
    }
    const trade:{id,user1,user2,when} = <{id,user1,user2,when}>await this.http.post(this.apiDomain+'/trades',data,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    }).toPromise();

    let requestBody=[]
    let user1_books=[]
    let user2_books=[]
    for (let index = 0; index < books1.length; index++) {
      const book = books1[index];
      requestBody.push({
        trade:trade.id,
        user:user1,
        book:book.id
      }) 

      user1_books.push(book.id)
    }
    for (let index = 0; index < books2.length; index++) {
      const book = books2[index];
      requestBody.push({
        trade:trade.id,
        user:user2,
        book:book.id
      }) 

      user2_books.push(book.id)
    }

    const response = await this.http.post(this.apiDomain+'/trades/books',requestBody,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    }).toPromise();

    this.http.patch(this.apiDomain+'/collection/'+user1,user1_books,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    }).toPromise();

    this.http.patch(this.apiDomain+'/collection/'+user2,user2_books,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    }).toPromise();


    return true;

    
  }

  deleteRequest(requestID){
    return this.http.delete(this.apiDomain+'/requests/'+requestID,{
      headers:new HttpHeaders({
        'Authorization':'token '+this.cookie.get('token')
      })
    }).toPromise();

  }

}

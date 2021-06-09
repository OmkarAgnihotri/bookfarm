import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { map } from "rxjs/operators";
import { UserAuthService } from '../services/user-auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.css']
})
export class TradesComponent implements OnInit {
  isLoading = true;
  trades = [];
  constructor(private booksService : BooksService,private cookie : CookieService,private usersService : UserAuthService,
              private router : Router, private route : ActivatedRoute) { }

  ngOnInit() {

  this.booksService.fetchTrades(+this.cookie.get('id'))
        .pipe(
            map((collection) => {
                const postArray = []

                for(const index in collection){
                  postArray.push({...collection[index]});
                }

                return postArray;
            } )
        )
        .subscribe(
          (collection) => {
          
          
            this.trades =  collection;

            this.trades.forEach(trade => {
                this.usersService.fetchUserById(+trade['user'])
                .subscribe(
                  (user:{id,first_name,last_name,email}) => {
                    trade['user'] = user.first_name;
                    this.isLoading = false
                  }
                )
            });
            
            this.isLoading = false
          }
        );
    
  }

  showDetails(trade,user){
      this.router.navigate(['details'],{ 
        relativeTo:this.route,
        queryParams:{
          'trade':trade,
          'user':user
        }
      });
  }

    
}

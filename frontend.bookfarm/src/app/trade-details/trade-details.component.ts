import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { UserAuthService } from '../services/user-auth.service';

@Component({
  selector: 'app-trade-details',
  templateUrl: './trade-details.component.html',
  styleUrls: ['./trade-details.component.css']
})
export class TradeDetailsComponent implements OnInit {

  constructor(private booksService : BooksService,private cookie : CookieService,
              private route : ActivatedRoute,private userService : UserAuthService) { }

  ngOnInit() {
      const trade = this.route.snapshot.queryParams['trade'];
      const user = this.route.snapshot.queryParams['user'];
      this.booksService.fetchBooksList(+trade,+user)
      .subscribe();

      this.booksService.fetchBooksList(+trade,+this.cookie.get('id'))
      .subscribe();

      this.userService.fetchUserById(user)
      .subscribe();
  }

}

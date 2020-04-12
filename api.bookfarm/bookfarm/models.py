from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager
from django.conf import settings
from django.utils import timezone
# Create your models here.


class UserManager(BaseUserManager):
    def create_user(self,email,password,first_name,last_name):
        email = self.normalize_email(email)

        user = self.model(
            email = email,
            first_name = first_name,
            last_name = last_name
        )

        user.set_password(password)
        user.save()
        return user

    def create_superuser(self,email,password):
        email = self.normalize_email(email)

        user = self.model(
            email = email,
        )

        user.set_password(password)
        user.save()
        return user

class User(AbstractBaseUser):
    username = None
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    email = models.EmailField(max_length=150,unique = True)
    password = models.CharField(max_length=100)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return str(self.email)

class Book(models.Model):
    title = models.CharField(max_length=1000)
    author = models.CharField(max_length=1000,blank = True,null = True)
    img_src = models.TextField(default = 'https://static.scientificamerican.com/sciam/cache/file/1DDFE633-2B85-468D-B28D05ADAE7D1AD8_source.jpg?w=590&h=800&D80F3D79-4382-49FA-BE4B4D0C62A5C3ED')


class Collection(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user', on_delete=models.CASCADE)
    book = models.ForeignKey('Book', related_name='book', on_delete=models.CASCADE)
    available = models.BooleanField(default = True)

    def __str__(self):
        return self.user.email

class Trade(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user2', on_delete=models.CASCADE)
    when = models.DateField(auto_now_add = True)

    def __str__(self):
        pass

class TradeInfo(models.Model):
    trade = models.ForeignKey('Trade', related_name='trade', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='owner', on_delete=models.CASCADE)
    book = models.ForeignKey('Book', related_name='book_in_trade', on_delete=models.CASCADE)
    
class Requests(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='isfrom',on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='to',on_delete=models.CASCADE)
    when = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.user1.first_name

    def __unicode__(self):
        return self.user1.first_name 

class RequestedBooks(models.Model):
    request = models.ForeignKey('Requests',related_name='request',on_delete=models.CASCADE)
    book = models.ForeignKey('Book',related_name='requested_book',on_delete=models.CASCADE)
    isApproved = models.BooleanField(default = False)

    def __str__(self):
        return self.book.title

    def __unicode__(self):
        return self.book.title


class ResponseBooks(models.Model):
    request = models.ForeignKey('Requests',related_name='response',on_delete=models.CASCADE)
    book = models.ForeignKey('Book',related_name='response_book',on_delete=models.CASCADE)
    isApproved = models.BooleanField(default = False)

    def __str__(self):
        return self.book.title

    def __unicode__(self):
        return self.book.title

class Cart(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='cart_owner',on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='book_owner',on_delete=models.CASCADE)
    book = models.ForeignKey('Book', related_name='book_to_be_requested', on_delete=models.CASCADE)

    def __str__(self):
        return self.user1.first_name

    def __unicode__(self):
        return self.user1.first_name

# class ResponseCart(models.Model):
#     user1 = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='response_cart_owner',on_delete=models.CASCADE)
#     user2 = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='response_book_owner',on_delete=models.CASCADE)
#     request = models.ForeignKey('Requests', related_name='repsonse_to_request', on_delete=models.CASCADE)
#     book = models.ForeignKey('Book', related_name='book_to_be_requested', on_delete=models.CASCADE)

#     def __str__(self):
#         return self.user1.first_name

#     def __unicode__(self):
#         return self.user1.first_name

class Confirmation(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='us1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='us2', on_delete=models.CASCADE)
    request = models.OneToOneField('Requests', related_name='deal_to_be_confirmed', on_delete=models.CASCADE)
    user1HasConfirmed = models.BooleanField(default=False)
    user2HasConfirmed = models.BooleanField(default=False)

    def __str__(self):
        return self.request.id

    def __unicode__(self):
        return self.request.id

class hello(models.Model):
    

    def __str__(self):
        return 

    def __unicode__(self):
        return 

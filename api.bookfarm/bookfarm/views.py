
from django.contrib.auth import get_user_model, logout                      
from django.shortcuts import get_object_or_404
from django.core.exceptions import ImproperlyConfigured
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .utils import get_and_authenticate_user, create_user_account, scrapBooks
from .models import *
from django.db.models import Count, Q
from rest_framework.exceptions import ValidationError

from . import serializers
from .utils import get_and_authenticate_user
from django.http import HttpResponse

User = get_user_model()

class AuthViewSet(viewsets.GenericViewSet):

    permission_classes = [AllowAny, ]

    serializer_class = serializers.EmptySerializer

    serializer_classes = {
        'login': serializers.UserLoginSerializer,
        'register': serializers.UserRegisterSerializer,
        'password_change': serializers.PasswordChangeSerializer,
    }

    @action(methods=['POST', ], detail=False)
    def login(self, request):
        serializer = serializers.UserLoginSerializer(data=request.data)

        # if not serializer.is_valid():
        #     raise ValidationError({"message":"Invalid Credentials"})
        serializer.is_valid(raise_exception = True)
        #if login details are valid fetch the User
        user = get_and_authenticate_user(**serializer.validated_data)

        #serialize User data
        data = serializers.AuthUserSerializer(user).data
        return Response(data=data, status=status.HTTP_200_OK)

    @action(methods=['POST', ], detail=False)
    def register(self, request):
        serializer = serializers.UserRegisterSerializer(data=request.data)
        # if not serializer.is_valid():
        #      raise ValidationError({"message":"Invalid email format"})
        serializer.is_valid(raise_exception = True)
        #create new user ( hashed password )
        user = User.objects.create_user(**serializer.validated_data)

        #serialize the response after adding the auth token
        data = serializers.AuthUserSerializer(user).data
        return Response(data=data, status=status.HTTP_201_CREATED)


    @action(methods=['POST', ], detail=False)
    def logout(self, request):
        request.user.auth_token.delete()
        logout(request)
        data = {'success': 'Sucessfully logged out'}
        return Response(data=data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, permission_classes=[IsAuthenticated, ])
    def password_change(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_serializer_class(self):
        if self.action in self.serializer_classes.keys():
            return self.serializer_classes[self.action]
        return super().get_serializer_class()

class ListUsersView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.UserSerializer


# class ListBooksView(viewsets.ViewSet):
#     # queryset = Book.objects.all()

#     # for row in queryset:
#     #     print(row.title)

#     # permission_classes = [AllowAny]
#     # serializer_class = serializers.BooksSerializer


#     def list(self,request):
#         queryset = Book.objects.all()
#         permission_classes=[IsAuthenticated]
#         serializer = serializers.BooksSerializer(queryset,many = True)
#         return Response(serializer.data)

#     def retrieve(self,request,pk=id):
#         queryset = Book.objects.all()
#         book = get_object_or_404(queryset,pk=pk)

#         permission_classes=[IsAuthenticated]
#         serializer = serializers.BooksSerializer(book)
#         return Response(serializer.data)



class UserTradesViewset(viewsets.ViewSet):
    
    def retrieve(self,request,pk = None):

        result = []
        qs = Trade.objects.filter(user1_id = pk).values()

        rs1 = []
        for record in qs:
            tmp={}
            tmp['id'] = record['id']
            tmp['user'] = record['user2_id']
            rs1.append(tmp)
        
        qs = Trade.objects.filter(user2_id = pk).values('id','user1_id')

        
        for record in qs:
            tmp={}
            tmp['id'] = record['id']
            tmp['user'] = record['user1_id']
            rs1.append(tmp)


        print(rs1)

        queryset = []

        for each in rs1:
            total_books = TradeInfo.objects.filter(trade_id = each['id']).count()
            mybooks = TradeInfo.objects.filter(trade_id = each['id']).filter(user_id = pk).count()
            each['books_received'] = mybooks
            each['books_given'] = total_books - mybooks

            queryset.append(each)

        return Response(queryset)

    def create(self,request):
        serializer = serializers.UserTradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(methods=['post'],detail=False)
    def books(self,request):
        result=[]
        for item in request.data:
            serializer = serializers.TradedBooksSerializer(data=item)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            result.append(serializer.data)
        return Response(result)

    def get_permissions(self):
        permission_classes = [IsAuthenticated]

        return [IsAuthenticated()]

class ListBooksView(viewsets.ViewSet):

    def list(self,request):     #   GET /books?user=?&searchstr=? 
        
        searchstr = request.GET.get('searchstr','')
        pk = request.query_params.get('user',None)
        queryset = Book.objects.filter(Q(title__icontains = searchstr) | Q(author__icontains = searchstr)).exclude(book__in = Collection.objects.filter(user = pk))
        
        if not queryset:
            response = []
            queryset = scrapBooks(searchstr)
            
            for book in queryset:
                result = Book.objects.filter(title__icontains=book['title'])
                
                if not result:
                    serializer = serializers.BooksSerializer(data=book)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    response.append(serializer.data)
                else:
                    serializer = serializers.BooksSerializer(instance=result,many=True)
                    response.extend(serializer.data)
                
            
            serializer = serializers.BooksSerializer(instance = response,many = True)

            return Response(serializer.data)
        else:
            serializer = serializers.BooksSerializer(queryset,many = True)

            return Response(serializer.data)

        

    def retrieve(self,request,pk = None):   #   GET /books/<book_id>
        queryset = Book.objects.get(id = pk)
        serializer = serializers.BooksSerializer(instance = queryset)
        return Response(serializer.data)
    

    def get_permissions(self):
        return [IsAuthenticated()]

class TradeDetailsViewSet(viewsets.ViewSet):
    def retrieve(self,request,pk=None):
        
        user = request.GET.get('user','')

        queryset = Book.objects.filter(book_in_trade__in = TradeInfo.objects.filter(trade = pk).filter(user = user))

        serializer = serializers.BooksSerializer(queryset,many = True)

        return Response(serializer.data)

    def get_permissions(self):
        return [IsAuthenticated()]

class CollectionViewSet(viewsets.ViewSet):
    def list(self,request,):
        searchstr = request.query_params.get('searchstr','')
        user = request.query_params.get('user','')
        queryset  = Collection.objects.filter(available = True).filter(Q(book__title__icontains=searchstr) | Q(book__author__icontains = searchstr)).exclude(user = user)
        serializer = serializers.CollectionSerializer(instance=queryset,many = True)
        return Response(serializer.data)

    def retrieve(self,request,pk = None):

        searchstr = request.GET.get('searchstr','')
        queryset  = Book.objects.filter(book__in = Collection.objects.filter(user = pk)).filter(Q(title__icontains=searchstr) | Q(author__icontains = searchstr))
        serializer = serializers.BooksSerializer(instance=queryset,many = True)

        return Response(serializer.data)

    def create(self,request):
        serializer = serializers.CollectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def get_permissions(self):
        return [IsAuthenticated()]

    def partial_update(self,request,pk = None):
        for book in request.data:
            try:
                instance = Collection.objects.filter(user=pk,book=book)[:1]
                for item in instance:
                    serializer = serializers.CollectionSerializer(instance=item,data={'available':False},partial=True)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
            except Collection.DoesNotExist:
                pass

        return Response(status=status.HTTP_204_NO_CONTENT)


class RequestsViewSet(viewsets.ViewSet):
    def list(self,request):
        user1 = request.query_params.get('user1')
        user2 = request.query_params.get('user2')

        requests = Requests.objects.filter(user1 = user1,user2 = user2)
        serializer = serializers.RequestsSerializer(instance=requests,many = True)
        return Response(serializer.data)


    @action(detail=False,url_path='sent')
    def sent(self,request):     #GET /requests/sent
        user = request.query_params.get('user',None)

        requests = Requests.objects.filter(user1=user)
        queryset=[]

        for request in requests:
            requested_books = RequestedBooks.objects.filter(request = request.id)
            serializer = serializers.RequestedBooksSerializer(instance=requested_books,many=True)
            
            tmp={}
            tmp['request_id'] = request.id
            tmp['user'] = request.user2_id
            tmp['requested_books'] = serializer.data
            tmp['when'] = request.when
            queryset.append(tmp)
        
        return Response(queryset)
    
    @action(detail=False,url_path='received')
    def received(self,request):     #GET /requests/received
        user = request.query_params.get('user',None)

        requests = Requests.objects.filter(user2=user)
        queryset=[]

        for request in requests:
            requested_books = RequestedBooks.objects.filter(request = request.id)
            serializer = serializers.RequestedBooksSerializer(instance=requested_books,many=True)
            
            tmp={}
            tmp['request_id'] = request.id
            tmp['user'] = request.user1_id
            tmp['requested_books'] = serializer.data
            tmp['when'] = request.when
            queryset.append(tmp)
        
        return Response(queryset)

    def create(self,request):   #   POST /requests
        serializer = serializers.RequestsSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(serializer.data)

    @action(detail=True,methods=['get'],url_path='response')      #GET /requests/<request_id>/response/get-books
    def response_books(self, request,pk):
        books = ResponseBooks.objects.filter(request = pk)
        serializer = serializers.ResponseBooksSerializer(instance=books,many = True)
        return Response(serializer.data)


    @action(detail = True,methods=['post'])         #   POST /requests/<request_id>/requested_books
    def requested_books(self,request,pk):
        response = []
        for book in request.data:
            serializer = serializers.RequestedBooksSerializer(data=book)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            response.append(serializer.data)
        
        return Response(response)


    @action(detail = True,methods=['post'],url_path='response/books')       #   POST /requests/<request_id>/response/books
    def response(self,request,pk):
        response = []
        for book in request.data:
            serializer = serializers.ResponseBooksSerializer(data=book)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            response.append(serializer.data)
        
        return Response(response)

    def partial_update(self,request,pk = None):
        book = request.query_params['book']
        instance = RequestedBooks.objects.filter(request=pk,book = book)[:1]
        for item in instance:
            serializer = serializers.RequestedBooksSerializer(instance=item,data=request.data,partial = True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['patch'],detail=True,url_path='response/approve')
    def approve(self,request,pk = None):

        book = request.query_params['book']

        instance = ResponseBooks.objects.filter(request=pk,book = book)[:1]
        
        for item in instance:
            serializer = serializers.RequestedBooksSerializer(instance=item,data=request.data,partial = True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self,request,pk = None):
        try:
            request = Requests.objects.get(id=pk)
            request.delete()
        except Requests.DoesNotExist:
            pass
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    

    def get_permissions(self):
        return [IsAuthenticated()]


class CartViewSet(viewsets.ViewSet):
    def retrieve(self,request,pk = None):
        cart = Cart.objects.filter(user1 = pk).order_by('user2')
        result = []

        if len(cart) > 0 :
            first = cart[0].user2_id

            tmp = {}
            tmp['user'] = cart[0].user2_id
            books = []
            for item in cart:
                if item.user2_id == first:
                    books.append(item.book_id)
                else:
                    tmp['books'] = books
                    result.append(tmp)

                    tmp={}
                    first=item.user2_id
                    tmp['user'] = item.user2_id
                    books = []
                    books.append(item.book_id)
                
            tmp['books']=books
            result.append(tmp)

        return Response(result)

    def create(self,request):
        serializer = serializers.CartSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def destroy(self,request,pk = None):
        
        user2 = request.query_params.get('user2')

        items = Cart.objects.filter(user1=pk,user2=user2)
        items.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class ConfirmationViewSet(viewsets.ViewSet):
    def retrieve(self,request,pk = None):
        try:
            queryset = Confirmation.objects.get(request = pk)
        except Confirmation.DoesNotExist:
            queryset = None
        serializer = serializers.ConfirmationSerializer(instance=queryset)
        return Response(serializer.data)

    def destroy(self,request,pk=None):
        instance = Confirmation.objects.get(request = pk)
        instance.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def create(self,request):
        serializer = serializers.ConfirmationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    
    def partial_update(self,request,pk=None):
        instance = Confirmation.objects.get(request = pk)
        serializer = serializers.ConfirmationSerializer(instance=instance,data=request.data,partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
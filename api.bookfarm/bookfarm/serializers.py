from rest_framework import serializers
from django.contrib.auth import get_user_model, password_validation
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager
from .models import *
from rest_framework.exceptions import ValidationError

#from django.config import settings

User = get_user_model()

# print(vars(User))

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=300)
    password = serializers.CharField(write_only = True)

class AuthUserSerializer(serializers.ModelSerializer):
    auth_token = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id','first_name','last_name','email','auth_token']

    def get_auth_token(self,obj):
        token = Token.objects.get_or_create(user = obj)
        # token1 = Token.objects.get_or_create(user = obj)
        # print(token.created)
        # print(token1)
        return token[0].key

class EmptySerializer(serializers.Serializer):
    pass


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    # def validate_email(self, email):
    #     user = User.objects.filter(email=email)
    #     if user:
    #         raise ValidationError({"message":"An account with the given email already exists"})
    #     return BaseUserManager.normalize_email(email)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_current_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Current password does not match')
        return value

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','email','first_name','last_name'] 


class BooksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id','title','author','img_src']

class UserTradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields=['id','user1','user2','when']

class TradedBooksSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeInfo
        fields=['id','trade','user','book']

    

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id','user','book','available']
    
class RequestsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requests
        fields = ['id','user1','user2','when']

class RequestedBooksSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestedBooks
        fields = ['id','request','book','isApproved']


class ResponseBooksSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseBooks
        fields = ['request','book','isApproved']


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ['id','user1','user2','book']

# class ResponseCartSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ResponseCart
#         fields = ['id','user1','user2','request','book']


class ConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confirmation
        fields = ['id','request','user1','user2','user1HasConfirmed','user2HasConfirmed']
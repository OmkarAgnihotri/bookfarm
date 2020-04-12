from rest_framework import routers
from django.urls import path,include
from .views import *

router = routers.DefaultRouter(trailing_slash=False)
router.register('auth', AuthViewSet, basename='auth')
router.register('users',ListUsersView)
router.register('books',ListBooksView,basename='books')
router.register('trades',UserTradesViewset,basename='trades')
router.register('tradeDetails',TradeDetailsViewSet,basename='tradeDetails')
router.register('collection',CollectionViewSet ,basename='collection')
router.register('books',ListBooksView ,basename='books')
router.register('requests',RequestsViewSet ,basename='requests')
router.register('cart',CartViewSet ,basename='cart')
router.register('confirmation',ConfirmationViewSet ,basename='cart')

urlpatterns = [
    path('',include(router.urls)),
]
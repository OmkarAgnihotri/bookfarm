import requests
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model
from bs4 import BeautifulSoup,SoupStrainer
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError,AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status
from lxml.html import fromstring

def get_and_authenticate_user(email, password):

    user = authenticate(username=email, password=password)
    if user is None:
        raise  ValidationError({'message':'Invalid username/password. Please try again!'})
    return user

def create_user_account(email, password, first_name="",
                        last_name="", **extra_fields):
    user = get_user_model().objects.create_user(
        email=email, password=password, first_name=first_name,
        last_name=last_name, **extra_fields)
    return user
def get_proxies():
    url = 'https://free-proxy-list.net/'
    response = requests.get(url)
    parser = fromstring(response.text)
    proxies = set()
    for i in parser.xpath('//tbody/tr')[:10]:
        if i.xpath('.//td[7][contains(text(),"yes")]'):
            proxy = ":".join([i.xpath('.//td[1]/text()')[0], i.xpath('.//td[2]/text()')[0]])
            proxies.add(proxy)
    return proxies

def scrapBooks(searchstr):
    proxies = get_proxies()
    querystr='/s?k='

    # searchstr = ''
    # list = inpstr.split();

    # for i in range(len(list)):
    #     if i != len(list)-1:
    #         searchstr+=list[i]
    #         searchstr+='+'

    baseurl='https://www.amazon.in'
    url = baseurl + querystr + searchstr

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36 Edg/80.0.361.111'}
    # headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64;x64; rv:66.0) Gecko/20100101 Firefox/66.0", "Accept-Encoding":"gzip, deflate","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "DNT":"1","Connection":"close", "Upgrade-Insecure-Requests":"1"}
    
    # proxies = { # define the proxies which you want to use
    #   'http': 'http://127.0.0.1',
    #   'https': 'http://195.22.121.13:443',
    # }

    # for proxy in proxies:
    #     try:
    #         page = requests.get(url ,headers = headers,proxies={'http':proxy})

    #         src = page.text

    #         strainer = SoupStrainer('div',attrs = {'class':'s-result-list s-search-results'})

    #         soup = BeautifulSoup(src,'lxml')

    #         titles = soup.find_all('h2')[:5]

    #         book_info = []

    #         for title in titles:
                
    #             new_url = baseurl+title.a.attrs['href']
                
    #             info_page = requests.get(new_url, headers = headers)

    #             details = info_page.content

    #             filter = SoupStrainer(id=['leftCol','centerCol'])

    #             info_soup = BeautifulSoup(details,'lxml',parse_only = filter)

    #             info_soup.prettify()

    #             book_title = info_soup.find('span',attrs = {'id':'productTitle'})

    #             book_img = info_soup.find('img',attrs={'class':'frontImage'})

    #             authors = info_soup.find_all('span',attrs = {'class':'author'})

    #             book_author = ''

    #             for author in authors:
    #                 author_name = author.find('a',attrs = {'class':'a-link-normal'})
    #                 book_author+=author_name.get_text().strip()
    #                 book_author+=' '

    #             if(book_author.find('Visit Amazon\'s')>=0):
    #                 book_author = book_author.replace('Visit Amazon\'s ','')
    #                 book_author = book_author.replace('Page ','')

    #             tmp={}

    #             if book_title is not None:
    #                 tmp['title'] = book_title.get_text()
    #                 tmp['author'] = book_author
    #                 tmp['img_src'] = book_img.attrs['src'].strip()

    #                 book_info.append(tmp)

    #         return book_info
    #     except:
    #         pass
    # page = requests.get(url ,headers = headers,proxies={'http':proxy})
    page = requests.get(url ,headers = headers)
    src = page.text

    strainer = SoupStrainer('div',attrs = {'class':'s-result-list s-search-results'})
    soup = BeautifulSoup(src,'lxml')

    titles = soup.find_all('h2')[:5]

    book_info = []

    for title in titles:
                
        new_url = baseurl+title.a.attrs['href']
                
        info_page = requests.get(new_url, headers = headers)

        details = info_page.content

        filter = SoupStrainer(id=['leftCol','centerCol'])
    
        info_soup = BeautifulSoup(details,'lxml',parse_only = filter)

        info_soup.prettify()

        book_title = info_soup.find('span',attrs = {'id':'productTitle'})

        book_img = info_soup.find('img',attrs={'class':'frontImage'})

        authors = info_soup.find_all('span',attrs = {'class':'author'})

        book_author = ''

        for author in authors:
            author_name = author.find('a',attrs = {'class':'a-link-normal'})
            book_author+=author_name.get_text().strip()
            book_author+=' '

        if(book_author.find('Visit Amazon\'s')>=0):
            book_author = book_author.replace('Visit Amazon\'s ','')
            book_author = book_author.replace('Page ','')

        tmp={}

        if book_title is not None:
            tmp['title'] = book_title.get_text()
            tmp['author'] = book_author
            tmp['img_src'] = book_img.attrs['src'].strip()

            book_info.append(tmp)

    return book_info
    


def custom_exception_handler(exception,context):
    response = exception_handler(exception, context)
    res = {}
    if isinstance(exception,ValidationError):
          
        if response.data.get("email", None):
            if response.data['email'][0].code == 'required':
                res['message'] = 'Email is a required field'
                res['status_code'] = status.HTTP_400_BAD_REQUEST
                return Response(res,status = status.HTTP_400_BAD_REQUEST)

            if response.data['email'][0].code == 'invalid':
                res['message'] = 'Invalid email format'
                res['status_code'] = status.HTTP_400_BAD_REQUEST
                return Response(res,status = status.HTTP_400_BAD_REQUEST)

            if response.data['email'][0].code == 'blank':
                res['message'] = 'Email field cannot be blank'
                res['status_code'] = status.HTTP_400_BAD_REQUEST
                return Response(res,status = status.HTTP_400_BAD_REQUEST)

            if response.data['email'][0].code == 'unique':
                res['message'] = 'User with this email already exists'
                res['status_code'] = status.HTTP_400_BAD_REQUEST
                return Response(res,status = status.HTTP_400_BAD_REQUEST)


            
        if response.data.get("password", None):
            if response.data['password'][0].code == 'required':
                res['message'] = 'Passsword is a required field'    
                res['status_code'] = status.HTTP_400_BAD_REQUEST
                return Response(res,status = status.HTTP_400_BAD_REQUEST)
            
            

    

    # if isinstance(exception,AuthenticationFailed):
    #     response.data['status_code'] = status.HTTP_401_UNAUTHORIZED
    #     return Response()

    # # print(response.data)
    # print(exception.detail)
    # print(exception.get_codes())
    # print(exception.get_full_details)
    # # # Now add the HTTP status code to the response.

    if response is not None:
        response.data['status_code'] = response.status_code

    return response
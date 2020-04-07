import requests
from bs4 import BeautifulSoup
querystr='/s?k='

searchstr = 'cl+liu'

baseurl='https://www.amazon.in'
url = baseurl + querystr + searchstr

#headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64;x64; rv:66.0) Gecko/20100101 Firefox/66.0", "Accept-Encoding":"gzip, deflate","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "DNT":"1","Connection":"close", "Upgrade-Insecure-Requests":"1"}
# proxies = { # define the proxies which you want to use
#   'http': 'http://127.0.0.1',
#   'https': 'http://195.22.121.13:443',
# }

page = requests.get(url ,headers = headers)

src = page.content


soup = BeautifulSoup(src,'lxml')

titles = soup.find_all('h2')[:5]

book_info = []
for title in titles:
    
    new_url = baseurl+title.a.attrs['href']
    
    info_page = requests.get(new_url, headers = headers)

    details = info_page.content

    info_soup = BeautifulSoup(details,'lxml')

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

    tmp['book_title'] = book_title.text
    tmp['book_author'] = book_author
    print(book_img['src'])

    book_info.append(tmp)


for book in book_info:
    print(book)
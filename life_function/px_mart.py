from selenium import webdriver  # import selenium模組
from bs4 import BeautifulSoup
import time
import re
import math
# import System
import sys


sys.setProperty("webdriver.chrome.driver", "./chromedriver.exe")

# from mongo import db

# print(soup)
# sections = soup.find_all("section", class_="vue-list-rent-item")
# print(sections)
# titles = soup.find_all("div", class_="item-title")
# # print(titles)
# for title in titles:
#   print(title.decode_contents().split('<')[0])

# images = soup.find_all("img", {'src': re.compile(r'https://img1.591.com.tw/house')})
# links = soup.find_all("a", {"href": re.compile(r'^https://rent.591.com.tw/rent-detail')})
# for link in links:
#   print(link.get('href'))


def getTitles(soup):
    titles = soup.find_all("div", class_="item-title")
    titlesReturn = []
    for title in titles:
        # print(title.decode_contents().split('<')[0])
        titlesReturn.append(title.decode_contents().split('\n')[
                            1].replace(' ', ''))
    return titlesReturn


def getLinks(soup):
    linkHtmls = soup.find_all(
        "a", {"href": re.compile(r'^https://rent.591.com.tw/rent-detail')})
    links = []
    for linkHtml in linkHtmls:
        # print(link.get('href'))
        links.append(linkHtml.get('href'))
    return links


def getHouseTypes(soup):
    # uls = soup.find_all("ul", class_="item-style")
    types = []
    # for ul in uls:
    #   li = soup.select("li", )
    ulList = soup.select('ul.item-style')
    for ul in ulList:
        liList = ul.select('li')
        types.append(liList[0].decode_contents())
    return types


def getAddressList(soup):
    spanList = soup.select('div.item-area span')
    addressList = []
    for span in spanList:
        district = span.decode_contents().split('-')[0]
        address = span.decode_contents().split('-')[1]
        addressList.append(district + address)
    return addressList


def getImages(soup):
    section = soup.select_one('section.vue-list-rent-content')
    ulList = section.select('ul.carousel-list')
    images = []
    # print(ulList)
    # print(len(ulList))
    for ul in ulList:
        li = ul.select_one('li')
        img = li.select_one('img')
        # print(img)
        images.append(img.get('data-original'))
        # images.append(img.get('src'))
        # images.append(ul.select_one('li img').get('src'))
    return images


def getPrices(soup):
    prices = []
    divList = soup.select('div.item-price-text')
    for div in divList:
        span = div.select_one('span')
        prices.append(span.decode_contents().replace(',', ''))
    return prices


def getAddress(soup): 
  # uls = soup.find_all("ul", class_="item-style")
    # types = []
    # for ul in uls:
    #   li = soup.select("li", )
    # addressList = soup.select('ul.item-style')
    address = soup.select('span.add b')
    # for ul in ulList:
    #     liList = ul.select('li')
    #     types.append(liList[0].decode_contents())
    print(address)
    # return types

def getData(url):
    driver = webdriver.Chrome('./chromedriver')  # 開啟chrome瀏覽器
    driver.get(url)  # 開啟連結
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    getAddress(soup)
    driver.close()  # 關閉連結
    return 

getData("https://twcoupon.com/brandshop-%E5%85%A8%E8%81%AF%E7%A6%8F%E5%88%A9%E4%B8%AD%E5%BF%83-%E9%9B%BB%E8%A9%B1-%E5%9C%B0%E5%9D%80.html")

def insertData(collection, houseData):
  houses = db[collection]
  if (len(houseData) == 0):
    return
  houses.insert_many(houseData)

def getDataAmount(firstPageUrl):
    driver = webdriver.Chrome('./chromedriver')  # 開啟chrome瀏覽器
    driver.get(firstPageUrl)  # 開啟連結
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    # print(soup.select_one('div.item-area span'))
    # print(soup.select_one('div.switch-amount span'))
    dataAmount = soup.select_one('div.switch-amount span').decode_contents().replace(',', '')
    return int(dataAmount)

# getAll()

def getDataOfRegion(region):
  firstPageUrl = "https://rent.591.com.tw/?region=" + str(region)
  dataAmount = getDataAmount(firstPageUrl)
  print(dataAmount)

  DataPerPage = 30
  page = math.floor(dataAmount / DataPerPage)
  for i in range (page):
    try:
        houseData = getData('https://rent.591.com.tw/?region=' + str(region) + '&firstRow=' + str(i * DataPerPage))
        print(i)
        print('https://rent.591.com.tw/?region=' + str(region) + '&firstRow=' + str(i * DataPerPage))
        insertData("houseData", houseData)
    except:
        continue

# getData('https://rent.591.com.tw/')

# 1 for Teipei
# 2 for New Taipei
getDataOfRegion(1)
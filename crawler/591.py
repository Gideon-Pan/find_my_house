from selenium import webdriver  # import selenium模組
from bs4 import BeautifulSoup
import time
import re
import math
import requests
import json
from datetime import date
import datetime
from selenium.webdriver.chrome.options import Options
import sys
import os
from dotenv import load_dotenv
from mongo import db
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

load_dotenv()
ENVIROMENT = os.environ.get("ENVIRONMENT")


HEADERS = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7,zh-CN;q=0.6',
    'Connection': 'keep-alive',
    'device': 'pc',
    'deviceid': 'ioto1qd414qtj36u9996h6v4k5',
    'Host': 'bff.591.com.tw',
    'Origin': 'https://rent.591.com.tw',
    'Referer': 'https://rent.591.com.tw/',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'token': '86cd80b00711cc9bc238d9ccf261da1e',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'X-CSRF-TOKEN': 'fT2rZUhpZNQU8Jx3a7ladraOG727JXNBwRIRTXOR',
}

chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--headless')

if (ENVIROMENT == 'local'):
    chromePath = './chromedriver'
else:
    chromePath = '/usr/bin/chromedriver'
#print(chromePath)
s = Service(chromePath)

def insertMongo(collection, houseData):
    houses = db[collection]
    if (len(houseData) == 0):
        return
    houses.insert_many(houseData)


def getIds(soup):
    # get html element for link anchor, which includes id information
    linkHtmls = soup.find_all(
        "a", {"href": re.compile(r'^https://rent.591.com.tw/rent-detail')})
    ids = []
    # get ids from links
    for linkHtml in linkHtmls:
        ids.append(linkHtml.get('href').split("-")[2].split(".")[0])
    return ids


def get_house_info(id):
    url = f"https://bff.591.com.tw/v1/house/rent/detail?id=" + str(id)
    r = requests.get(url, headers=HEADERS, timeout=5)
    web_content = r.text
    web_content = json.loads(web_content)
    return web_content


def insertData(url):
    driver = webdriver.Chrome(chromePath, chrome_options=chrome_options)
    driver.get(url)  # 開啟連結
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.close()  # 關閉連結
    ids = getIds(soup)
    housesData = []
    today = date.today()
    # get house data by id
    # print(ids)
    for id in ids:
        try:
            houseData = get_house_info(id)
            # time.sleep(1)
            ts = time.time()
            houseData['timestamp'] = ts
            houseData['id'] = id
            housesData.append(houseData)
        except Exception as e:
            print("Unexpected error:", str(e))
            continue
    print("Today's date:", today)
    # insert house data into mongodb
    insertMongo("houseDataRaw" + str(today), housesData)

    return


def getDataAmount(firstPageUrl):
    driver = webdriver.Chrome(chromePath, chrome_options=chrome_options)
    driver.get(firstPageUrl)  # 開啟連結
    time.sleep(5)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    dataAmount = soup.select_one(
        'div.switch-amount span').decode_contents().replace(',', '')
    return int(dataAmount)


def insertDataOfRegion(region, kind):
    firstPageUrl = "https://rent.591.com.tw/?region=" + \
        str(region) + "&kind=" + str(kind)
    dataAmount = getDataAmount(firstPageUrl)
    print(dataAmount)

    DataPerPage = 30
    page = math.floor(dataAmount / DataPerPage)
    for i in range(page + 5):
        try:
            #print(123)
            houseData = insertData(
                'https://rent.591.com.tw/?region=' + str(region) + "&kind=" + str(kind) + '&firstRow=' + str(i * DataPerPage))
            print('finish inserting page ' + str(i))
            time.sleep(2)

        except Exception as e:
            print(e)
            continue


# 1 for Teipei
# 3 for New Taipei
regions = [1, 3]
# 2 for 獨立套房
# 3 for 分租套房
# 4 for 雅房
kinds = [2, 3, 4]
for region in regions:
    #print('123')
    for kind in kinds:
        try:
            insertDataOfRegion(region, kind)
        except Exception as e:
            print(e)
            continue
today = date.today()
delete_date = today - datetime.timedelta(days=3)
# drop house data three days ago
db["houseDataRaw" + str(delete_date)].drop()
exit()

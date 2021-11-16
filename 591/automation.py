from selenium import webdriver  # import selenium模組
from bs4 import BeautifulSoup
import time
import re
import math
from mongo import db
import requests
import json
from datetime import date
from selenium.webdriver.chrome.options import Options
import sys
import os
from dotenv import load_dotenv
import traceback
load_dotenv()
# import dnspython
ENVIROMENT = os.environ.get("ENVIRONMENT")

chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--headless')
HEADERS2 = {
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


def insertData(collection, houseData):
    houses = db[collection]
    if (len(houseData) == 0):
        return

    houses.insert_many(houseData)

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


def getIds(soup):
    linkHtmls = soup.find_all(
        "a", {"href": re.compile(r'^https://rent.591.com.tw/rent-detail')})
    ids = []
    for linkHtml in linkHtmls:
        # print(link.get('href'))
        ids.append(linkHtml.get('href').split("-")[2].split(".")[0])
    return ids


def get_house_info(id):
    url = f"https://bff.591.com.tw/v1/house/rent/detail?id=" + str(id)
    # print("URL:", url)
    # try:
    r = requests.get(url, headers=HEADERS2, timeout=5)
    # print(r)
    web_content = r.text
    # print(web_content)
    web_content = json.loads(web_content)
    # print(web_content)
    # print(web_content['data']['positionRound']['mapData'])

    # data = web_content['data']['positionRound']['mapData']
    # traffic = data[0]
    # living = data[1]
    # education = data[2]
    # print(traffic)
    # time.sleep(0.5)
    return web_content

def insertMongo(collection, houseData):
    houses = db[collection]
    print (collection)
    print(houseData)
    if (len(houseData) == 0):
        return
    houses.insert_many(houseData)


def insertData(url):
    chrome = 'chromedriver'
    if (ENVIROMENT == 'local'):
        driver = webdriver.Chrome('./chromedriver')  # 開啟chrome瀏覽器
    else:
        driver = webdriver.Chrome(executable_path='/usr/bin/chromedriver', options=chrome_options)  # 開啟chrome瀏覽器
    driver.get(url)  # 開啟連結
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.close()  # 關閉連結
    # titles = getTitles(soup)
    # print(titles)
    # print(len(titles))
    ids = getIds(soup)
    # print(ids)
    # return
    housesData = []
    today = date.today()
    # print(ids)
    for id in ids:
        try:
            houseData = get_house_info(id)
            # time.sleep(1)
            ts = time.time()
            houseData['timestamp'] = ts
            houseData['id'] = id
            # pprint(houseData)
            housesData.append(houseData)
        # print('finish fetching data of id:' + str(id))
        # print(housesData[0])
        # pprint(housesData)
        # return
        # print(id)
        except Exception as e:
            ex_type, ex_value, ex_traceback = sys.exc_info()
            print("Unexpected error:", str(e))
            print(sys.exc_info()[1], "......")
            errorMessage = [{
                'date': str(today),
                'url': f"https://bff.591.com.tw/v1/house/rent/detail?id=" + str(id),
                'errorMessage': str(e)
            }]
            insertMongo("Error" + str(today), errorMessage)
            continue
    
    print("Today's date:", today)
    # insertMongo("houseDataRaw11-999" , housesData)
    # print(len(housesData))
    insertMongo("houseDataRaw" + str(today), housesData)

    # print(id)
    # print('finish inserting page' + str(0))

    return

# insertData('https://rent.591.com.tw/?region=3')


def getDataAmount(firstPageUrl):
    if (ENVIROMENT == 'local'):
        driver = webdriver.Chrome('./chromedriver')  # 開啟chrome瀏覽器
    else:
        driver = webdriver.Chrome(executable_path='/usr/bin/chromedriver', options=chrome_options)  # 開啟chrome瀏覽器
    driver.get(firstPageUrl)  # 開啟連結
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    # print(soup.select_one('div.item-area span'))
    # print(soup.select_one('div.switch-amount span'))
    dataAmount = soup.select_one(
        'div.switch-amount span').decode_contents().replace(',', '')
    return int(dataAmount)

# getAll()


def insertDataOfRegion(region, kind):
    firstPageUrl = "https://rent.591.com.tw/?region=" + str(region) + "&kind=" + str(kind)
    dataAmount = getDataAmount(firstPageUrl)
    print(dataAmount)

    DataPerPage = 30
    page = math.floor(dataAmount / DataPerPage)
    for i in range(page + 5):
        try:
            houseData = insertData(
                'https://rent.591.com.tw/?region=' + str(region) + "&kind=" + str(kind) + '&firstRow=' + str(i * DataPerPage))
            # print(i)
            # print('https://rent.591.com.tw/?region=' + str(region) + '&firstRow=' + str(i * DataPerPage))
            print('finish inserting page ' + str(i))
            time.sleep(2)
            # insertData("houseData", houseData)
        # except:
        #     print('page ' + str(i) + 'fail')
        #     print("Unexpected error:", sys.exc_info()[0])
        #     print("Unexpected error:", sys.exc_info()[0])
        #     return
        #     errorMessage = [{
        #         'date': date.today(),
        #         'url': f"https://bff.591.com.tw/v1/house/rent/detail?id=" + str(id),
        #         # 'errorMessage': sys.exc_info()[0]
        #     }]

        #     insertMongo("Error" + "test", errorMessage)
        #     print('recording error')
        #     continue
        #     continue
        except Exception as e:
            # Get current system exception
            ex_type, ex_value, ex_traceback = sys.exc_info()

            # Extract unformatter stack traces as tuples
            trace_back = traceback.extract_tb(ex_traceback)

            # Format stacktrace
            stack_trace = list()

            for trace in trace_back:
                stack_trace.append("File : %s , Line : %d, Func.Name : %s, Message : %s" % (trace[0], trace[1], trace[2], trace[3]))

            # print("Exception type : %s " % ex_type.__name__)
            # print("Exception message : %s" %ex_value)
            print('error message:', str(e))
            # print("Stack trace : %s" %stack_trace)
            exit()
            return

# getData('https://rent.591.com.tw/')


# 1 for Teipei
# 3 for New Taipei
regions = [1, 3]
kinds = [2, 3, 4]
for region in regions:
    for kind in kinds:
        insertDataOfRegion(region, kind)
exit()


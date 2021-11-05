import requests
from bs4 import BeautifulSoup
import re
from pprint import pprint
import json
from mongo import db
import math
import time

# HEADERS = {
#     'authority': 'scrapeme.live',
#     'dnt': '1',
#     'upgrade-insecure-requests': '1',
#     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
#     'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
#     'sec-fetch-site': 'none',
#     'sec-fetch-mode': 'navigate',
#     'sec-fetch-user': '?1',
#     'sec-fetch-dest': 'document',
#     'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
# }

# HEADERS = {
#     'Accept': 'application/json, text/javascript, */*; q=0.01',
#     'Cookie': '_ga=GA1.3.1945101253.1634045683; _gat=1; _gid=GA1.3.1071130538.1634367434; newUI=1; new_rent_list_kind_test=0; urlJumpIp=1; urlJumpIpByTxt=%E5%8F%B0%E5%8C%97%E5%B8%82; _dc_gtm_UA-97423186-1=1; _ga=GA1.4.1945101253.1634045683; _gid=GA1.4.1071130538.1634367434; 591_new_session=eyJpdiI6ImdPc1wvdm9sNzZpUXRZWWIzdUhyMXFBPT0iLCJ2YWx1ZSI6Ik0xNHYzb3ZIY3FuYlBnUStMVkluQjN4ZzRcL2VcL3NtUGNTdHlEc3BcL1FKamRvZzQ5dzlLc3ZLaVRnMVRvM3BNTllpYlFjSmZhbnpjMzVxcUZQaEhYQkFRPT0iLCJtYWMiOiIxZGVmYTQxZDZlZmE3MjUxYmVhMzNmNTRkODBmMDZmYWM1YjM4MmU4YjdhNWUyMDUzMzBlMDkxMTk3ZjZiMjQ3In0%3D; house_detail_stat=%5B%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211563524%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211538122%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211546961%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211427696%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211427696%22%7D%5D; XSRF-TOKEN=eyJpdiI6ImhCTExZVVRublNndmFNVU5JZVFBM1E9PSIsInZhbHVlIjoiR2tXdmNneG5wbmVqS1dQeWdJcnlZaTdZRElvRGFQSERobEhQQktwMmowYkQzeHlHTFpobDBFUlJ4SndcL3BoQnZVVVdwcTNPN3dNM25NV0tUYmtHYVd3PT0iLCJtYWMiOiJkOTliNWNmNjRhMDAyZDNjMTIxN2IzYWU2ZWE2OGQ0M2IwMTZiY2QwYTQ3YzAxZTdhMGE5YzM2MWQwMWNhOWE4In0%3D; _fbp=fb.2.1634045695383.713179379; last_search_type=1; is_new_index=1; is_new_index_redirect=1; user_browse_recent=a%3A1%3A%7Bi%3A0%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11563524%3B%7D%7D; user_index_role=1; index_keyword_search_analysis=%7B%22role%22%3A%220%22%2C%22type%22%3A2%2C%22keyword%22%3A%22%E6%B0%B8%E5%92%8C%E5%8D%80%22%2C%22selectKeyword%22%3A%22%22%2C%22menu%22%3A%22%22%2C%22hasHistory%22%3A1%2C%22hasPrompt%22%3A0%2C%22history%22%3A0%7D; user_sessionid=ika47vrihsj8cht0pqdfk937e1; PHPSESSID=ika47vrihsj8cht0pqdfk937e1; T591_TOKEN=gkhe5ekpbu24p58a8e62pk39u7; tw591__privacy_agree=0',
#     'Accept-Language': 'zh-tw',
#     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
#     'Host': 'rent.591.com.tw',
#     'Referer': 'https://rent.591.com.tw/?region=1',
#     'X-CSRF-TOKEN': csrf,
#     'X-Requested-With': 'XMLHttpRequest',
#     'sec-fetch-dest': 'document',
#     'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
#     'token': '86cd80b00711cc9bc238d9ccf261da1e',
# }

csrf = 'zXNpE247kBDpVIjDC4ngNseKtKZPd1riTz2pDjMe'
# csrf = ''

HEADERS1 = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7,zh-CN;q=0.6',
    'Connection': 'keep-alive',
    'Cookie': 'T591_TOKEN=ioto1qd414qtj36u9996h6v4k5; _ga=GA1.3.1586033170.1634208414; _ga=GA1.4.1586033170.1634208414; user_index_role=1; __auc=aec2b6c217c7f042f436d589486; is_new_index=1; is_new_index_redirect=1; new_rent_list_kind_test=0; tw591__privacy_agree=1; last_search_type=1; _gid=GA1.3.7181039.1635690033; _gid=GA1.4.7181039.1635690033; webp=1; PHPSESSID=86cd80b00711cc9bc238d9ccf261da1e; localTime=1; newUI=1; __utma=82835026.1586033170.1634208414.1635854082.1635907432.10; __utmc=82835026; __utmz=82835026.1635907432.10.10.utmcsr=localhost:3000|utmccn=(referral)|utmcmd=referral|utmcct=/; XSRF-TOKEN=XSRF-TOKEN=eyJpdiI6Ik9tZ1pzMlgwMHhJV0ZBbmdBQU9mRVE9PSIsInZhbHVlIjoiMUorNHJmUHo4TkxyMmJ1aExhczV3YXdiaHVPQkJTUlNQNUZSQ1UzOWZNanI1MEFMTHNDZHlJUFgzVEFkN0pHQTdDaE9cL1hXb0JpNmIxRUJ5OFV1WHpBPT0iLCJtYWMiOiJkMzUxMGU0YzQ0MWU0ZTAzODUyZjU4NjI2YzdmMDFiZTViNjVhNTBkOWFhMTdjYjU0MGYyYTdjMzViZTFlZWE4In0%3D; user_browse_recent=a%3A5%3A%7Bi%3A0%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11578849%3B%7Di%3A1%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11556750%3B%7Di%3A2%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11596357%3B%7Di%3A3%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11611697%3B%7Di%3A4%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11431839%3B%7D%7D; 591_new_session=eyJpdiI6Iks1YVVuNTBYRUhmNEkxK3M1K3pwTGc9PSIsInZhbHVlIjoiSVZVTXB6dEY2TDU0OUtNZmdudFo2WE0wQ0JPWmgzaThUeWJOdytqdlMzemwyMXZKblwvaXp5c0pURzJ0eGFHWXFud0lCdzk0TkZzUEJhQWtITkNJV1NBPT0iLCJtYWMiOiJlYmU2YjExYzc2ZTNlYzQwMDZiZjgwYjA5YWFhNDc1NjI2MmE2YzkxYjVlNDUyOTI3ZDU3YmNjNWI1YmQwMDFhIn0%3D; urlJumpIp=1; urlJumpIpByTxt=%E6%96%B0%E5%8C%97%E5%B8%82',
    'device': 'pc',
    'deviceid': 'ioto1qd414qtj36u9996h6v4k5',
    'Host': 'rent.591.com.tw',
    'Origin': 'https://rent.591.com.tw',
    'Referer': 'https://rent.591.com.tw/',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'token': '86cd80b00711cc9bc238d9ccf261da1e',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'X-CSRF-TOKEN': csrf,
    'X-Requested-With': 'XMLHttpRequest'
}

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

regions = [1, 3]
def getDataAmount(region):
    url = f"https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region=" + str(region)
    
    # print(url)
    r = requests.get(url, headers=HEADERS1)
    print(r)
    web_content = r.text
    # print(web_content)
    web_content = json.loads(web_content)
    # pprint(web_content)
    # print(web_content['records'])
    dataAmount = web_content['records']
    return int(dataAmount.replace(',', ''))

# getDataAmount(3)

def get_house_info(id):
    url = f"https://bff.591.com.tw/v1/house/rent/detail?id=" + str(id)
    # print("URL:", url)
    # try:
    r = requests.get(url, headers=HEADERS2)
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
    
        

# get_house_info(11599895)

def get_ids(region, page):
    url = f"https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region=" + str(region) + "&firstRow=" + str(page * 30)
    # print("URL", url)
    r = requests.get(url, headers=HEADERS1)
    web_content = r.text
    # print(web_content)
    web_content = json.loads(web_content)
    # print(web_content)
    houses = web_content['data']['data']
    ids = []
    for house in houses:
        ids.append(house['post_id'])
    # ids.append(houses[0]['post_id'])
    return ids
    # print(ids)
    housesData = []
    for id in ids:
        houseData = get_house_info(id)
        pprint(houseData)
        housesData.append(houseData)
    # print(housesData[0])
    # pprint(housesData)
    insertData("houseDataNew", housesData)
    print('finish inserting page' + str(page))

# get_url(123)
# insertData("houseDataNew", [{'name': 'gideon'}])

def insert_data_by_region(region):
    # get data amount of the region
    dataAmount = getDataAmount(region)
    print(dataAmount)
    # return
    totalPage = math.floor(dataAmount / 30)
    # iterate all pages of the region
    for page in range(totalPage):
        if (page <= 102):
            continue
        # iterate all house(id) in one page
        ids = get_ids(region, page)
        housesData = []
        # print(ids)
        for id in ids:
            houseData = get_house_info(id)
            ts = time.time()
            houseData['timestamp'] = ts
            houseData['id'] = id
            # pprint(houseData)
            housesData.append(houseData)
            # print('finish fetching data of id:' + str(id))
            # print(housesData[0])
            # pprint(housesData)
        insertData("houseDataRawNew", housesData)
        print('finish inserting page' + str(page))
        # time.sleep(2)



# def main():
#     for i in regions:
        # insert_data_by_region(i)
        # print('finish insert region' + str(i))

# main()
insert_data_by_region(1)
print('finish insert region' + str(1))

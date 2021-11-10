from types import new_class
import requests
import json
from urllib.parse import unquote

# a_session = requests.Session()
# a_session.get('https://rent.591.com.tw/')
# session_cookies = a_session.cookies
# cookies_dictionary = session_cookies.get_dict()

csrf = 'ZOu2RtUWKZNKX62uogt0PbZ2qZsBpoGw7KlHmWTi'
# new_session = 'eyJpdiI6Ink3WTJ3djZjcTJ4NXlSZXVNWENZT0E9PSIsInZhbHVlIjoiZFNuS0p2ck54Tk9LZjB5MkhQTk03azlZa1VzTHZITkhick5cL2N3Z0hRWlRrcWF2ZnJ4NVhSeFAzXC92VUdkZ1k2ZHdCZUZrYkdBOFZ1elQ1NUllbXZ2QT09IiwibWFjIjoiMmFlZjdjMTAyNjQ5ZjgxNDI1MWJjMzFjNTFmZTdjOTU5ODcwNmNkYWNmMmY2NzJkY2RkMjAxYzQyMjU0MGZhNyJ9'
# new_session = 'eyJpdiI6InZUMUFlR2E4elM1elZHWVNlN1hzekE9PSIsInZhbHVlIjoiWStrMzdvMzB6cGFJWTM0Vnkwcmk4VHpOazRvTFwvQlYzWjZvcWVoVlhVeEZ1RWtlbDFJSzJWXC9ObkRmVFhiNmZidlVkT3ZBQVNQd0srbEFuRGxRak5yUT09IiwibWFjIjoiZWNkMDQ3NWY2NDcxMDJjYzk2NTA3MDcxNGEyNThiZDM0NTA4ODczN2ZlYjM2YjM2YjhlZGQ5ODI1MmI2NTVhZCJ9'
global new_session0
new_session0 = 0
global new_session1
new_session1 = 1
global new_session2
new_session2 = 2
# new_session = 'eyJpdiI6IjQ0TXVtYjhJMEpzYjQ1MVFxYUhMZHc9PSIsInZhbHVlIjoiamg0QmtxWjZjUjNRUUZBVmdXdVhMVGtUOTdIb2h3bm5CK2UwOXlrZHlkUEhkZldGSmZFZ25RdGZLeHB0ZHlLWVJhbm1pYmp3Z20xZWw4WlZKWVhYckE9PSIsIm1hYyI6IjMyZjc0NjFmZmJjMTAyMDY4MTBlNWJmZTQzODAwY2U1NWU2YTg3ZjJkNGJlNzA4NTdhZWY0NmRhY2Q1ZDM1Y2UifQ%3D%3D'
HEADERS = {
    'authority': 'scrapeme.live',
    'dnt': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    # 'Cookie': 'T591_TOKEN=ioto1qd414qtj36u9996h6v4k5; _ga=GA1.3.1-586033170.1634208414; _ga=GA1.4.1586033170.1634208414; user_index_role=1; __auc=aec2b6c217c7f042f436d589486; is_new_index=1; is_new_index_redirect=1; new_rent_list_kind_test=0; tw591__privacy_agree=1; last_search_type=1; _gid=GA1.3.7181039.1635690033; _gid=GA1.4.7181039.1635690033; webp=1; PHPSESSID=86cd80b00711cc9bc238d9ccf261da1e; localTime=1; newUI=1; __utma=82835026.1586033170.1634208414.1635854082.1635907432.10; __utmc=82835026; __utmz=82835026.1635907432.10.10.utmcsr=localhost:3000|utmccn=(referral)|utmcmd=referral|utmcct=/; XSRF-TOKEN=XSRF-TOKEN=eyJpdiI6Ik9tZ1pzMlgwMHhJV0ZBbmdBQU9mRVE9PSIsInZhbHVlIjoiMUorNHJmUHo4TkxyMmJ1aExhczV3YXdiaHVPQkJTUlNQNUZSQ1UzOWZNanI1MEFMTHNDZHlJUFgzVEFkN0pHQTdDaE9cL1hXb0JpNmIxRUJ5OFV1WHpBPT0iLCJtYWMiOiJkMzUxMGU0YzQ0MWU0ZTAzODUyZjU4NjI2YzdmMDFiZTViNjVhNTBkOWFhMTdjYjU0MGYyYTdjMzViZTFlZWE4In0%3D; user_browse_recent=a%3A5%3A%7Bi%3A0%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11578849%3B%7Di%3A1%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11556750%3B%7Di%3A2%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11596357%3B%7Di%3A3%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11611697%3B%7Di%3A4%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11431839%3B%7D%7D; 591_new_session=' + new_session + '; urlJumpIp=1; urlJumpIpByTxt=%E6%96%B0%E5%8C%97%E5%B8%82',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
}


def makeHeaders(new_session):
    return {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7,zh-CN;q=0.6',
        'Connection': 'keep-alive',
        'Cookie': 'T591_TOKEN=ioto1qd414qtj36u9996h6v4k5; _ga=GA1.3.1-586033170.1634208414; _ga=GA1.4.1586033170.1634208414; user_index_role=1; __auc=aec2b6c217c7f042f436d589486; is_new_index=1; is_new_index_redirect=1; new_rent_list_kind_test=0; tw591__privacy_agree=1; last_search_type=1; _gid=GA1.3.7181039.1635690033; _gid=GA1.4.7181039.1635690033; webp=1; PHPSESSID=86cd80b00711cc9bc238d9ccf261da1e; localTime=1; newUI=1; __utma=82835026.1586033170.1634208414.1635854082.1635907432.10; __utmc=82835026; __utmz=82835026.1635907432.10.10.utmcsr=localhost:3000|utmccn=(referral)|utmcmd=referral|utmcct=/; XSRF-TOKEN=XSRF-TOKEN=eyJpdiI6Ik9tZ1pzMlgwMHhJV0ZBbmdBQU9mRVE9PSIsInZhbHVlIjoiMUorNHJmUHo4TkxyMmJ1aExhczV3YXdiaHVPQkJTUlNQNUZSQ1UzOWZNanI1MEFMTHNDZHlJUFgzVEFkN0pHQTdDaE9cL1hXb0JpNmIxRUJ5OFV1WHpBPT0iLCJtYWMiOiJkMzUxMGU0YzQ0MWU0ZTAzODUyZjU4NjI2YzdmMDFiZTViNjVhNTBkOWFhMTdjYjU0MGYyYTdjMzViZTFlZWE4In0%3D; user_browse_recent=a%3A5%3A%7Bi%3A0%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11578849%3B%7Di%3A1%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11556750%3B%7Di%3A2%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11596357%3B%7Di%3A3%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11611697%3B%7Di%3A4%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11431839%3B%7D%7D; 591_new_session='
        + str(new_session) +
        '; urlJumpIp=1; urlJumpIpByTxt=%E6%96%B0%E5%8C%97%E5%B8%82',
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


# print(cookies_dictionary)

# print (response.cookies)
# for cookie in response.cookies.keys():
#   print(response.cookies.get(cookie))

def setCookies0(region):
    response = requests.get(
        "https://rent.591.com.tw/?region=" + str(region), headers=HEADERS)
    cookies = response.cookies.get_dict()
    # print(cookies['591_new_session'])
    global new_session0
    # new_session = unquote(cookies['591_new_session'])
    new_session0 = cookies['591_new_session']
    print(new_session0)
    # print('~~~~')


def setCookies1(region):
    global new_session0
    # print(new_session0)
    HEADERS0 = makeHeaders(new_session0)
    response = requests.get(
        "https://union.591.com.tw/ssp?callback=unionName_22&pid=22&regionid=3&_v=2021-11-7", headers=HEADERS0)
    print(response)
    cookies = response.cookies.get_dict()
    print(cookies['591_new_session'])
    # global new_session
    # new_session = unquote(cookies['591_new_session'])
    global new_session1
    new_session1 = cookies['591_new_session']
    # print(new_session1)


def getDataAmount(region):
    # print(new_session)
    url = f"https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region=" + \
        str(region)
    # print(new_session)
    global new_session1
    print(new_session1)
    new_session1 = 'eyJpdiI6Ik1VT2xUY0VYTnRJeER1OUZJWmsxTFE9PSIsInZhbHVlIjoiUkJvWlZUaDRQXC9yNWVQWUlXZ0Z5Y1wvVVp3TVptM3FcL3Y5RFlON2NrSCtRaVBrNEplcnIxNHN5RXJ1SWVTTjkyOW1JZXRQVGFMVno5bzlLWjZtUUFUNFE9PSIsIm1hYyI6ImJkYzI2YWFhZTYxMDJjNGFlMThkOTQ2NmY0OTAwYmE2NDJkYzNlOTM5YzMxMGQ2MWM0OTYwOGYxYzZjZjdlYTIifQ%3D%3D'
    print('~~~~')
    print(new_session1)
    HEADERS1 = makeHeaders(new_session1)
    # print(HEADERS1)
    # print(new_session)
    # print(url)
    r = requests.get(url, headers=HEADERS1)
    # print(r)
    web_content = r.text
    # print(web_content)
    web_content = json.loads(web_content)
    # pprint(web_content)
    print(web_content['records'])
    dataAmount = web_content['records']
    return int(dataAmount.replace(',', ''))

# setCookies(1)
# getDataAmount(1)


setCookies0(1)
setCookies1(1)
# getDataAmount(1)

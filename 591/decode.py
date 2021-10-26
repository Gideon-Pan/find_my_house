import requests
from bs4 import BeautifulSoup
import re
from pprint import pprint
import json
# import urllib2

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
# Cookie = '_ga=GA1.3.1945101253.1634045683; _gat=1; _gid=GA1.3.1071130538.1634367434; newUI=1; new_rent_list_kind_test=0; urlJumpIp=1; urlJumpIpByTxt=%E5%8F%B0%E5%8C%97%E5%B8%82; _dc_gtm_UA-97423186-1=1; _ga=GA1.4.1945101253.1634045683; _gid=GA1.4.1071130538.1634367434; 591_new_session=eyJpdiI6ImdPc1wvdm9sNzZpUXRZWWIzdUhyMXFBPT0iLCJ2YWx1ZSI6Ik0xNHYzb3ZIY3FuYlBnUStMVkluQjN4ZzRcL2VcL3NtUGNTdHlEc3BcL1FKamRvZzQ5dzlLc3ZLaVRnMVRvM3BNTllpYlFjSmZhbnpjMzVxcUZQaEhYQkFRPT0iLCJtYWMiOiIxZGVmYTQxZDZlZmE3MjUxYmVhMzNmNTRkODBmMDZmYWM1YjM4MmU4YjdhNWUyMDUzMzBlMDkxMTk3ZjZiMjQ3In0%3D; house_detail_stat=%5B%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211563524%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211538122%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211519172%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211546961%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211427696%22%7D%2C%7B%22type%22%3A%221%22%2C%22resource%22%3A%228%22%2C%22post_id%22%3A%2211427696%22%7D%5D; XSRF-TOKEN=eyJpdiI6ImhCTExZVVRublNndmFNVU5JZVFBM1E9PSIsInZhbHVlIjoiR2tXdmNneG5wbmVqS1dQeWdJcnlZaTdZRElvRGFQSERobEhQQktwMmowYkQzeHlHTFpobDBFUlJ4SndcL3BoQnZVVVdwcTNPN3dNM25NV0tUYmtHYVd3PT0iLCJtYWMiOiJkOTliNWNmNjRhMDAyZDNjMTIxN2IzYWU2ZWE2OGQ0M2IwMTZiY2QwYTQ3YzAxZTdhMGE5YzM2MWQwMWNhOWE4In0%3D; _fbp=fb.2.1634045695383.713179379; last_search_type=1; is_new_index=1; is_new_index_redirect=1; user_browse_recent=a%3A1%3A%7Bi%3A0%3Ba%3A2%3A%7Bs%3A4%3A%22type%22%3Bi%3A1%3Bs%3A7%3A%22post_id%22%3Bi%3A11563524%3B%7D%7D; user_index_role=1; index_keyword_search_analysis=%7B%22role%22%3A%220%22%2C%22type%22%3A2%2C%22keyword%22%3A%22%E6%B0%B8%E5%92%8C%E5%8D%80%22%2C%22selectKeyword%22%3A%22%22%2C%22menu%22%3A%22%22%2C%22hasHistory%22%3A1%2C%22hasPrompt%22%3A0%2C%22history%22%3A0%7D; user_sessionid=ika47vrihsj8cht0pqdfk937e1; PHPSESSID=ika47vrihsj8cht0pqdfk937e1; T591_TOKEN=gkhe5ekpbu24p58a8e62pk39u7; tw591__privacy_agree=0'
Cookie = 'webp=1; PHPSESSID=ioto1qd414qtj36u9996h6v4k5; newUI=1; T591_TOKEN=ioto1qd414qtj36u9996h6v4k5; _ga=GA1.3.1586033170.1634208414; _ga=GA1.4.1586033170.1634208414; user_index_role=1; __auc=aec2b6c217c7f042f436d589486; localTime=1; is_new_index=1; is_new_index_redirect=1; new_rent_list_kind_test=0; tw591__privacy_agree=1; urlJumpIp=1; urlJumpIpByTxt=台北市; user_browse_recent=a:4:{i:0;a:2:{s:4:"type";i:1;s:7:"post_id";i:11506687;}i:1;a:2:{s:4:"type";i:1;s:7:"post_id";s:8:"11206941";}i:2;a:2:{s:4:"type";i:1;s:7:"post_id";i:11542104;}i:3;a:2:{s:4:"type";i:1;s:7:"post_id";i:11329754;}}; _gid=GA1.3.663056650.1634460233; _gid=GA1.4.663056650.1634460233; last_search_type=1; bid[pc][59.120.195.65]=3228; _gat=1; _dc_gtm_UA-97423186-1=1; XSRF-TOKEN=eyJpdiI6IlBNVGp1THhRb3NNSlhOQUhPbmN0ZFE9PSIsInZhbHVlIjoiZ3ZOMGlBRkZlSmJ2OHBpN21wZURtZFhxcXZJMW4xMjZuekZJZWVWY1NQaktzZ0N3T0dGK1VsS1FaUFFFQVpXT0Ircnd4TGFpUHZMUTRBWmFGUVVuNVE9PSIsIm1hYyI6ImJhZTE2OTVlMzE0OWI4NDU2OTQxM2EzNTI5ZGUyMjQ3MTIxYzc4ZGNjMmFkNGI2Y2IyODM4Y2FmNzQxZTA3NWQifQ==; _gat_UA-97423186-1=1; 591_new_session=eyJpdiI6ImJVWGFPQndCZ2hDbUlsc3BxNDdRckE9PSIsInZhbHVlIjoiTmZaOEZLM1cyMDJPTG44SjhqampWd09rRElhSmM1Nml5OHUwaEF2dXdcL3doUzdXXC9ncWFvZ3J4a2p6TzYzU2I1czNPclwvakhvSEpBbVlsN1dwQUxsWUE9PSIsIm1hYyI6IjU5MGNiZmFiMzE1NDNlOWU1ODQxMmMxNDFkZGE2NTAxOTliMWJlYjgzNGY5OTdjODJjZjYwYzlhYzI3OTA5MTQifQ=='
HEADERS = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Cookie': Cookie.encode("utf-8").decode("latin1"),
    'Accept-Language': 'zh-tw',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
    'Host': 'rent.591.com.tw',
    'Referer': 'https://rent.591.com.tw/?region=1',
    'X-CSRF-TOKEN': '4NfFIBWDJtOvGNR7VJdf9I4R1adoXhDolEDcB12z',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'accept-encoding': 'identity'
}

def fetch_content_url(page):
    # url = f"https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region=1"
    # url = f"https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&"
    url = f"https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&firstRow=30&totalRows=14111"
    print("URL:", url)
    # try:
    r = requests.get(url, headers=HEADERS)
    web_content = r.text
    web_content = web_content.encode('ISO-8859-1')
    web_content = web_content.decode('UTF-8')
    # web_content = web_content.decode('ISO-8859-1')
    # pprint(web_content)
    soup = BeautifulSoup(web_content, 'html.parser')
    # soup = BeautifulSoup(web_content, 'lxml')
    pprint(soup.text)

    # pprint(json.loads(str(soup)))
    # links = soup.find_all("a", href=re.compile("/bbs/Stock/M."))
    # # pprint(links)
    # for link in links:
        # print(link.get('href'))


fetch_content_url(5021)

# for i in range(10):
#     fetch_content_url(5021)


url="https://rent.591.com.tw/"
html=requests.get(url)
# print(html.encoding)
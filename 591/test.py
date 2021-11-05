import requests
import re

headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    # 'Cookie': Cookie.encode("utf-8").decode("latin1"),
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


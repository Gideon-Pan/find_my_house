import requests

# a_session = requests.Session()
# a_session.get('https://rent.591.com.tw/')
# session_cookies = a_session.cookies
# cookies_dictionary = session_cookies.get_dict()

# print(cookies_dictionary)
response = requests.get("https://rent.591.com.tw")

for cookie in response.cookies.keys():
  print(response.cookies.get(cookie))
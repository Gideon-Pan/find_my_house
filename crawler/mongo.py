import os
import pymongo
from dotenv import load_dotenv
load_dotenv()
# import dnspython
password = os.environ.get("MONGO_PASSWORD")
database = os.environ.get("MONGO_DATABASE")
host = os.environ.get("MONGO_HOST")

ENVIROMENT = os.environ.get("ENVIRONMENT")
MONGO_HOST = os.environ.get("MONGO_HOST")

if (ENVIROMENT == 'local'):
    client = pymongo.MongoClient('localhost', 27017)
else:
    client = pymongo.MongoClient("mongodb://mongouser:" + password + "@" + MONGO_HOST +
                                 ":27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")

db = client["591_raw"]

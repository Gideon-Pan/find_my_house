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
  client = pymongo.MongoClient("mongodb://mongouser:" + password + "@" + MONGO_HOST + ":27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")

# client = pymongo.MongoClient("mongodb+srv://Gideon:" + password + "@cluster0.0fwjx.mongodb.net/" + database + "?retryWrites=true&w=majority")
# client = pymongo.MongoClient("mongodb://" + host + ":27017")
# print("mongodb://mongouser:" + password + '@' + host + ":27017")
# client = pymongo.MongoClient("mongodb://mongouser:" + password + "@3.145.22.184:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
# client = pymongo.MongoClient("mongodb://mongouser:" + password + "@" + host)


db = client["591_raw"]
# post = {"author": "13",
#          "text": "My first blog post!",
#          "tags": ["mongodb", "python", "pymongo"],
#          }

# posts = db.posts
# post_id = posts.insert_one(post).inserted_id
# print ("post id is ", post_id)

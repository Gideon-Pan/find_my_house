import pymongo
from dotenv import load_dotenv
load_dotenv()
import os
# import dnspython
password = os.environ.get("MONGO_PASSWORD")
database = os.environ.get("MONGO_DATABASE")

# client = pymongo.MongoClient("mongodb+srv://Gideon:" + password + "@cluster0.0fwjx.mongodb.net/" + database + "?retryWrites=true&w=majority")
client = pymongo.MongoClient("mongodb://mongouser:" + password + "@127.0.0.1:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
db = client["591_data"]
# post = {"author": "13",
#          "text": "My first blog post!",
#          "tags": ["mongodb", "python", "pymongo"],
#          }

# posts = db.posts
# post_id = posts.insert_one(post).inserted_id
# print ("post id is ", post_id)
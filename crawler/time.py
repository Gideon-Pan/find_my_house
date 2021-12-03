from datetime import date
from mongo import db
import datetime

today = date.today()
print("Today's date:", today)
delete_date = today - datetime.timedelta(days=3)
print(delete_date)

def insertMongo(collection, houseData):
    houses = db[collection]
    if (len(houseData) == 0):
        return
    houses.insert_many(houseData)

# print(today)
# print("houseDataRaw" + str(today))
#insertMongo("houseDataRaw" + str(today), [{'test': 'hi'}])
# insertMongo("houseDataRaw11-10" , [{'test': 'hi'}])

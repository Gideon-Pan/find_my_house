from datetime import date
from mongo import db

today = date.today()
print("Today's date:", today)


def insertMongo(collection, houseData):
    houses = db[collection]
    if (len(houseData) == 0):
        return
    houses.insert_many(houseData)

print(today)
# print("houseDataRaw" + str(today))
#insertMongo("houseDataRaw" + str(today), [{'test': 'hi'}])
# insertMongo("houseDataRaw11-10" , [{'test': 'hi'}])

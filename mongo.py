import hmac
import random
import string
import hashlib
import pymongo
import sys
from bson.json_util import dumps

connection = pymongo.MongoClient().GoalBall

def add_user(username, password, email):
	password_hash = make_pw_hash(password)

	loginInfo = {'_id': username, 'password': password_hash}
	user={'_id': username}
	if email != "":
		loginInfo['email'] = email
		user['email']=email

	try:
		connection.login.insert_one(loginInfo)
        
	except pymongo.errors.DuplicateKeyError as e:
		print "username is already taken"
		return False
	except pymongo.errors.OperationFailure:
		print "mongo error"
		return False
	try: 
		connection.users.insert_one(user)
	except pymongo.errors.OperationFailure:
		print "mongo error"
		return False
	return True

def validate_login(username, password):

	loginInfo = None
	try:
		loginInfo = connection.login.find_one({'_id': username})
	except:
		print "Unable to query database for user"
		return None

	if loginInfo is None:
		print "User not in database"
		return None

	salt = loginInfo['password'].split(',')[1]

	if loginInfo['password'] != make_pw_hash(password, salt):
		print "user password is not a match"
		return None

	# Looks good get the user info
	user=None
	try:
		user=connection.users.find_one({'_id': username})
	except:
		print "Unable to query database for user"

	return dumps(user)


def make_salt():
	alt = ""
	for i in range(5):
            salt = salt + random.choice(string.ascii_letters)
	return salt

def make_pw_hash(pw,salt=None):
	if salt == None:
		salt = make_salt();
	return hashlib.sha256(pw + salt).hexdigest()+","+ salt

def createUser(username, fName, lName, role, instution):
	try:
		connection.users.update_one({"_id":username}, 
			{
		"$set": {
			"FirstName": fName,
			"LastName":lName,
			"role":role,
			"instution":instution,
			"teams":[]
		},
		"$currentDate": {"lastModified": True}
	})
	except pymongo.errors.OperationFailure:
		print 'mongo error'
		return False
	return True

def joinTeam(username, team):
	try:
		connection.users.update_one({"_id":username}, 
			{ "$addToSet": { "teams": team } })
	except pymongo.errors.OperationFailure:
		print 'mongo error'
		return False
	return True
    
def getuser(username):
	try:
		user=connection.users.find_one({'_id': username})
	except:
		print "Unable to query database for user"
	return dumps(user)


# add_user("buzz", "pass12", "testMail@mail.com")
# createUser("buzz","Buzz", "Lakata","master","Drexel")
# add_user("tj","password","jhv")
# createUser()
# add_user("jordan","pass21","stone@drexel.edu")
# add_user("buzz", "pass1234", "testMail2@mail.com")
# username=raw_input("username: " )
# password=raw_input("password: ")
# email=raw_input("email: ")
# print add_user(username, password, email)
print validate_login("buzz", "pass12")


# connection.users.find_one({})
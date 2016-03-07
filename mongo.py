import hmac
import random
import string
import hashlib
import pymongo
import sys
from bson.json_util import dumps

connection = pymongo.MongoClient().GoalBall

def add_user(username, password, email=""):
	'''add_user(username, password, email="") takes in a username, password and optional email to add a new 
user into the login database. if the username is already taken it will not create a new user
it will also create a new entry in the user db with the email and user name to be updated later'''
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
	'''validate_login(username, password) takes in username and password and checks the database to see if the password
is correct. if it is it will return the entery in the users database with the same username'''
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
	'''createUser(username, fName, lName, role, instution) take is information to update the user info created in 
add_user. it should be called right afer add_user.'''
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
	"""joinTeam(username, team) takes in teh username of the person you want to add to a team and 
assoctates that person with that team in the database."""
	try:
		connection.users.update_one({"_id":username}, 
			{ "$addToSet": { "teams": team } })
	except pymongo.errors.OperationFailure:
		print 'mongo error'
		return False
	return True
    
def getuser(username):
	'''getuser(username) returns the user from the database. if you need to update the object 
form the database this is what you need. '''
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
# print add_user.__doc__
# print validate_login.__doc__
# print createUser.__doc__
# print joinTeam.__doc__
# print getuser.__doc__

# connection.users.find_one({})
import hmac
import random
import string
import hashlib
import pymongo
import sys

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

        user = None
        try:
            user = connection.login.find_one({'_id': username})
        except:
            print "Unable to query database for user"

        if user is None:
            print "User not in database"
            return None

        salt = user['password'].split(',')[1]

        if user['password'] != make_pw_hash(password, salt):
            print "user password is not a match"
            return None

        # Looks good
        return user


def make_salt():
        salt = ""
        for i in range(5):
            salt = salt + random.choice(string.ascii_letters)
        return salt

def make_pw_hash(pw,salt=None):
        if salt == None:
            salt = make_salt();
        return hashlib.sha256(pw + salt).hexdigest()+","+ salt


# add_user("buzz", "pass12", "testMail@mail.com")
# add_user("jordan","pass21","stone@drexel.edu")
# add_user("buzz", "pass1234", "testMail2@mail.com")
username=raw_input("username: " )
password=raw_input("password: ")
email=raw_input("email: ")
print add_user(username, password, email)
# print validate_login("buzz", "pass12")




var MongoClient = require('mongodb'),
	ObjectId = require('mongodb').ObjectID,
	Server = require('mongodb').Server,
	Q = require("q"),
	connection="mongodb://localhost:27017/GoalBall",
	md5=require("md5")

function makeSalt(){
	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function hashPassword(pw, salt){
	if (!salt){
		salt=makesalt()
	}
	return md5(pw+salt)+","+salt
}

function addUser(username, password, email){
	var deferred=Q.defer();
	var passhash=hashPassword(password)
	var loginInfo = {'_id': username, 'password': passhash}
	var user={'_id': username}
	if (email){
		loginInfo['email'] = email
		user['email']=email
	}

	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
  	}

	var collection = db.collection('login');

	
	collection.insertOne(loginInfo, function(err, item) {
		if (err){
			deferred.reject(err)
			return deferred.promise;
		}
		var collection = db.collection('users');
		collection.insertOne(loginInfo, function(err, item) {
			if (err){deferred.reject(err)}
			deferred.resolve(item)});
		});
		
	});
	return deferred.promise;
}

function validate_login(username, password){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('login');

	
	collection.findOne({"_id":username}, function(err, item) {
		if (err){deferred.reject(err)}
		if (item==null){
			deferred.reject("user does not exist")
			return deferred.promise
		}
		var salt = item['password'].split(',')[1]
		if (item['password'] != hashPassword(password, salt)){
			deferred.reject("password does not match")
			return deferred.promise;
		}
		else{
			var collection=db.collection('users')
			collection.findOne({"_id":username}, function(err, item) {
				if (err){deferred.reject(err)}
				else{deferred.resolve(item)}
			});
		}


		
	});
	
	});
	return deferred.promise;
}

function getUser(username){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('users');

	
	collection.findOne({"_id":username}, function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
}

function createUser(username, fName, lName, role, instution){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('users');

	
	collection.updateOne({"_id":username},{"$set": {
			"FirstName": fName,
			"LastName":lName,
			"role":role,
			"instution":instution,
			"teams":[]
		}},
		function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
}

function joinTeam(username, team){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('users');

	
	collection.updateOne({"_id":username}, { "$addToSet": { "teams": team }}, function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
	
}

function getTournament(tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.findOne({"_id":ObjectId(tournamentID)},  function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
}

function joinTournament(username, tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.updateOne({"_id":ObjectId(tournamentID)}, { "$addToSet": { "requests": username } }, function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
	
}
function removeRequest(username, tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.updateOne({"_id":ObjectId(tournamentID)}, { "$pull": { "requests": username } }, function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
}
function moveName(username, tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.updateOne({"_id":ObjectId(tournamentID)}, { "$pull": { "requests": username }, "$addToSet":{"players":username} }, function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
}


function getTournamentID(tournamentName){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.findOne({"name":tournamentName}, function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item["_id"])}
	});
	
	});
	return deferred.promise;
	
}

function createTournement(name, teamLimit, userName){
	var tourn={'name': name, 
		'teams': [], 
		'matchups': [], 
		'limit': teamLimit, 
		'requests': [],
		'matchups':[],
		"players":[],
		'admin':userName}

	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.insertOne(tourn, function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;

}

function addToTournement(team, tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.updateOne({"_id":ObjectId(tournamentID)}, 
			{ "$addToSet": { "teams": team } },
			 function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
}

function getAllTourns(){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');
	 collection.find({}).toArray(function(err, item) {
		if (err){deferred.reject(err)}
		else{
			// console.log(item)
			deferred.resolve(item)
		}
	});
	});
	return deferred.promise;
}

function getTournByAdmin(username){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');
	 collection.find({"admin":username}).toArray(function(err, item) {
		if (err){deferred.reject(err)}
		else{
			// console.log(item)
			deferred.resolve(item)
		}
	});
	});
	return deferred.promise;
}
function getTournPlayers(tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');
	 collection.findOne({"_id":ObjectId(tournamentID)}, function(err, item) {
		if (err){deferred.reject(err)}
		else{
			// console.log(item)
			deferred.resolve(item["players"])
		}
	});
	});
	return deferred.promise;
}



function getTournTeams(tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');
	 collection.findOne({"_id":ObjectId(tournamentID)}, function(err, item) {
		if (err){deferred.reject(err)}
		else{
			// console.log(item)
			deferred.resolve(item["teams"])
		}
	});
	});
	return deferred.promise;
}

function addToBracket(mathcUp, tournamentID){
	var deferred = Q.defer();
	MongoClient.connect(connection, function(err, db) {
  	if(err) {
   		deferred.reject(err);
   		return deferred.promise;
  	}

	var collection = db.collection('tournaments');

	
	collection.updateOne({"_id":ObjectId(tournamentID)}, 
			{ "$addToSet": { "matchups": mathcUp } },
			 function(err, item) {
		if (err){deferred.reject(err)}
		else{deferred.resolve(item)}
	});
	
	});
	return deferred.promise;
}

function test1(){
  // newPlate("ma", "qwe9876")
  // addMessage("PA","abc1234", "im going to run you off the road if you keep fucking around", "mike", 3)
  getAllTourns().then(function(data){
      console.log(data);
  }, function(error){
      console.log(error);
  });

}
function get(){
	
	getTournPlayers("572b67aece40b2203a586441").then(function(data){
      console.log(data);
  }, function(error){
      console.log(error);
  });
}

// test1()
get()
// 572b67aece40b2203a586441







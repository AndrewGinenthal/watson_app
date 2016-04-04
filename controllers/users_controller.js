// REQUIREMENTS
var express = require('express');
var router = express.Router();
var User = require('../models/users.js');
var Sentence = require('../models/sentences.js');
var passport = require('passport');

// middleware to check login status
function isLoggedIn(req, res, next) {
    console.log('isLoggedIn middleware');     
    if (req.isAuthenticated()) {
        console.log("successful login!")
        return next(); 
    } else {      
        console.log("BAD LOGIN")
        res.redirect('/');
    }
};

// SIGNUP
router.post('/signup', passport.authenticate('local-signup', {
    failureRedirect: '/'}), function(req, res){
	console.log("HIT SIGNUP ROUTE")
    console.log("USER STUFF HERE   " + req.user);
    res.send(req.user);
});

// LOGIN
router.post('/login', passport.authenticate('local-login'), function(req, res){
    res.send(req.user);
});

// IS LOGGED IN
router.get('/isLoggedIn', function(req, res) {
    if (req.isAuthenticated() == true) {
        // console.log("IS LOGGED IN, BETCH: " + req.user);
        res.send(req.user);
    }
    else {
        console.log("not logged in");
        res.send("not logged in");
    }
});

// LOGOUT
router.get('/logout', function(req, res) {
    console.log("LOGGING OUT");
    // log user out
    req.session.destroy();
    req.user = null;
    res.send(req.user);
    // redirect to index
    // res.send(req.user);
});

// SENTENCE SHOW PAGE
router.get('/thought/:id', function(req, res){
	console.log(req.params.id)
	console.log("SHOW ROUTE")
	Sentence.findById(req.params.id, function(err, data){
		res.json(data)
	})
})

// EDIT PROFILE
router.post('/edit', function(req, res){
	console.log("HIT EDIT ROUTE IN EXPRESS")
	console.log(req.body)
	User.findById(req.user, function(err, user){
		user.username = req.body.username
		user.email = req.body.email
		user.save();
		res.send(user)
	})
})

// DELETE SENTENCE
router.delete('/:id', function(req, res){

	console.log("DELETE ROUTE")
	console.log("HERE IS REQ.PARAMS", req.params.id)
	console.log("REQ.BODY:    ", req.body)	
	User.findById(req.user, function(err, user){
		console.log("found user!!!!! ", user)

		Sentence.findById(req.params.id, function(err, sentence){
			console.log("FOUND SENTENCE", sentence)
			for (var i = 0; i<user.sentences.length; i++){
				if(user.sentences[i]._id == sentence.id){
					console.log("found a match!")
					user.sentences.splice(i, 1)
					console.log("spliced!")
					user.save()
				}else{console.log("NO MATCH!!!!!")}
			}res.send(user)
		})
	})

});







//WATSON STUFF
var watson = require('watson-developer-cloud')
var auth = require('../auth.js')
var tone_analyzer = watson.tone_analyzer(auth.tone_analyzer)



router.post('/:id/add_transcript', function(req, res){

		// =====================================
		// FUTURE IMPLEMENTATION: ANONYMOUS USER
		// =====================================
		// 	if(req.params.id = undefined){
		// 	var newSentence = new Sentence;
		// 	newSentence.content = req.body.data;
		// 	newSentence.anonymous = true;
		// 	newSentence.save();
		// 	console.log(newSentence)
		// 	res.send(newSentence)
		// 	return
		// }

	User.findById(req.params.id, function(err, user){



		console.log("adding sentence to THIS user: ", user.username)
		var newSentence = new Sentence;
		// assign string from request object to newSentence content key
		newSentence.content = req.body.data
		newSentence.save();
		//run watson tone analyzer
		tone_analyzer.tone({text: req.body.data}, function(err, result){
		if(err){
			return console.log(err)
		}
		//assign watson result to analysis key
		newSentence.analysis = result

		//save newSentence
		newSentence.save()	

		user.sentences.push(newSentence)
		user.save();
		console.log("did the push actually happen? here is the user that was just saved", user)
		res.send(newSentence);
	})
// 	tone_analyzer.tone({text: req.body.data}, function(err, result){

// 	if(err){
// 		return console.log(err)
// 	}

// 	newSentence.analysis = result
// 	newSentence.save()
// 	// console.log(JSON.stringify(result, null, 2));

// 	var categories = result.document_tone.tone_categories;
// 	categories.forEach(function(cat){
// 		console.log(cat.category_name);
// 		cat.tones.forEach(function(tone){			
// 			console.log(" %s: %s", tone.tone_name, tone.score)
// 		})	
// 	})
// })

	})
})




module.exports = router;
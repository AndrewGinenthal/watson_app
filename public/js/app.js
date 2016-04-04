var app = angular.module('speechApp', []);

document.getElementById("deleteButton").style.visibility = "hidden"	

app.controller('doStuff', ['$http', '$scope', function($http, $scope){

	

	var self = this;
	
	self.viewingSingle = true


	// CREATE EMPTY OBJECT TO HOLD USER ID
	var userObj = {};

	//delete SENTENCE
	this.delete = function(sentence, index){

		// self.viewingSingle = false

		console.log(sentence)
		console.log(index)
		$http({
			method: 'delete',
			url: '/user/' + sentence._id,
			data: sentence
		}).then(
			function(response){
				console.log(response)
				console.log($scope)
				$scope.ctrl.single.sentences.splice(index, 1)
				document.getElementById("stats").innerHTML = null
				document.getElementById("currentSentence").innerHTML = null
				document.getElementById("deleteButton").style.visibility = "hidden"
				document.getElementById("chartContainer").style.visibility = "hidden"

			}
		)
	};

	// LOGIN FUNCTION
	this.logIn = function(){
		console.log("LOGIN function firing in app.js");
		$http({
			method: 'post',
			url: '/user/login',
			data: this.loginData
		}).then(
		//success
		function(response){
			console.log(response);
			
			userObj.id = response.data._id;
			// variable to call in template
			self.single = response.data;
			// self.user = true for logged in data
			self.user = true;
			
			self.loginData.email = '';
			self.loginData.password = '';
		},
		function(err){
			// make login error true to change class
			console.log("bad login")
	    	self.loginError = true;
			// create variable for element with login-status id
			// var box = document.getElementById('login-status');
			// // add text to p tag
	  //   	box.innerHTML = "Incorrect login, please try again!";
		}
		);
	};	



	this.submitEdit = function(){

		console.log("hitting edit route")
		console.log(this.newData)
		$http({
			method: 'POST',
			url: '/user/edit',
			data: this.newData
		}).then(
		function(response){
			console.log(response)
			console.log($scope)
			$scope.ctrl.single.username = response.data.username

		}
		)
	}

	this.showOne = function(index){
		// self.viewingSingle = true
		document.getElementById("chartContainer").style.visibility = "visible"
		document.getElementById("deleteButton").style.visibility = "visible"
		self.sentence = $scope.ctrl.single.sentences[index]
		self.deleteIndex = index

		console.log($scope.ctrl.single.sentences)
		

		var currentSentence = document.getElementById("currentSentence");
		var sentenceObject = $scope.ctrl.single.sentences[index];
		var sentence = sentenceObject.content;
		// console.log(sentence);
		currentSentence.innerHTML = sentence;

			var emotions = []
			var scores = []

				for (var j = 0; j< $scope.ctrl.single.sentences[index].analysis.document_tone.tone_categories[0].tones.length; j++){
					
					var emotion = $scope.ctrl.single.sentences[index].analysis.document_tone.tone_categories[0].tones[j].tone_name
					var emotionScore = $scope.ctrl.single.sentences[index].analysis.document_tone.tone_categories[0].tones[j].score
					emotions.push(emotion)
					scores.push(emotionScore)
	
				}

		var currentSentence = document.getElementById("currentSentence");
		var statsBox = document.getElementById("stats")
		var sentenceObject = $scope.ctrl.single.sentences[index];

		var sentence = sentenceObject.content;
		// console.log(sentence);
		currentSentence.innerHTML = sentence;
		

		var emotionsList = document.createElement('ul');


		for (var i = 0; i < emotions.length; i++){
			var emotion = document.createElement('li');
		 	emotion.innerHTML = emotions[i] + ": " + scores[i]
			emotionsList.appendChild(emotion);
		}
		statsBox.innerHTML = ''
		statsBox.appendChild(emotionsList);
		
		console.log(emotions)
		console.log(scores)

		var data = {
    	labels: [emotions[0], emotions[1], emotions[2], emotions[3], emotions[4]],
    	datasets: [
        {
            label: "My First dataset",
            fillColor: "papayawhip",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "#e6f3ff",
            highlightStroke: "rgba(220,220,220,1)",
            data: [scores[0], scores[1], scores[2], scores[3], scores[4]]
        }
    ]
};

		var ctx = document.getElementById("myChart").getContext("2d");
		var myNewChart = new Chart(ctx).Bar(data);

}

	// USER LOGGED IN VERIFICATION
	this.getUser = function() {
		$http({
			method: 'GET',
			url: '/user/isLoggedIn'
		}).then(
		// success
		function(response) {

		// console.log($scope.ctrl.single.sentences[0])
			console.log(response.data);
			// if statement to determine whether user is logged in or not
			if (response.data.username != null) {
				// user is logged in
				self.user = true;
				// variable to call in template
				self.single = response.data;
				// id needs to be defined if already logged in
				userObj.id = response.data._id;
			}
			else {
				// user is not logged in
				self.user = false;
			};
		});
	};


	// EVOKE GET USER FUNCTION ON PAGE LOAD
	this.getUser();


	this.addTranscript = function(){
		console.log('ADDING TRANSCRIPT OMG')
		console.log(self.transcript)

		var x = self.transcript

		$http({
			method: 'POST',
			url: '/user/' + userObj.id + '/add_transcript',
			data: {'data' : x}
		}).then(
		function(response){
			console.log(response)
			console.log($scope.ctrl.single.sentences)
			$scope.ctrl.single.sentences.unshift(response.data)
			self.showOne(0)
		})
	}

	window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

	var recognizer = new window.webkitSpeechRecognition()
	console.log(recognizer)

	var transcription = document.getElementById('transcription')
	// var log = document.getElementById('log');

	recognizer.continuous = false;

	recognizer.onresult = function(event){
		transcription.textContent = ' ';

		for (var i = event.resultIndex; i < event.results.length; i++){
			if (event.results[i].isFinal) {
	              transcription.value = event.results[i][0].transcript;

	              var completeSentence = transcription.value
	              console.log(completeSentence)
	              self.transcript = completeSentence
	              self.addTranscript()
	              
	            } else {
	              transcription.value += event.results[i][0].transcript;
				}
		}
	}
	document.getElementById('button-play-ws').addEventListener('click', function(){
		recognizer.continuous = false;
		recognizer.interimResults = false;
		try {
			recognizer.start();
			// log.innerHTML = 'recognition started' + '  ' + log.innerHTML;
		} catch(ex){
			// log.innerHTML = 'recognition error: ' + ex.message + '  ' + log.innerHTML
		}
	})



	this.signUp = function(){
		// console.log(this.signUpData);
		$http({
			method: 'POST',
			url: '/user/signup',
			data: this.signUpData
		}).then(
		//success
		function(response){
			console.log(response.data);

			self.user = true;
				// variable to call in template
				self.single = response.data;
				// id needs to be defined if already logged in
				userObj.id = response.data._id;
			// reset form
			self.signUpData.email = undefined;
			self.signUpData.password = undefined;
			self.signUpData.username = undefined;

		});
	};

	// LOGOUT
	this.logout = function() {
		console.log("logout firing in app.js")
		$http({
			method: "GET",
			url: "/user/logout"
		}).then(
		// success
		function(response) {
			console.log("logged out");

			// reset all user logged in state and template objects
			self.single = null;
			self.user = false;

		});
	};
}])



console.log("js connected")



// window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// var recognizer = new window.webkitSpeechRecognition()
// console.log(recognizer)

// var transcription = document.getElementById('transcription')
// // var log = document.getElementById('log');

// recognizer.continuous = false;

// recognizer.onresult = function(event){
// 	transcription.textContent = ' ';

// 	for (var i = event.resultIndex; i < event.results.length; i++){
// 		if (event.results[i].isFinal) {
//               transcription.value = event.results[i][0].transcript;

//               var completeSentence = transcription.value
//               console.log(completeSentence)
              
//             } else {
//               transcription.value += event.results[i][0].transcript;
// 			}
// 	}
// }
// document.getElementById('button-play-ws').addEventListener('click', function(){
// 	recognizer.continuous = false;
// 	recognizer.interimResults = false;
// 	try {
// 		recognizer.start();
// 		// log.innerHTML = 'recognition started' + '  ' + log.innerHTML;
// 	} catch(ex){
// 		// log.innerHTML = 'recognition error: ' + ex.message + '  ' + log.innerHTML
// 	}
// })


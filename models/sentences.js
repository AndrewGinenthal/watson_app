var mongoose = require('mongoose');

var sentenceSchema = mongoose.Schema({
	content: String,
	analysis: Object
})

var Sentence = mongoose.model('Sentence', sentenceSchema);
module.exports = Sentence;
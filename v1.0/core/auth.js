// core/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '270256063152691', // your App ID
		'clientSecret' 	: 'ebfd00a8dd374eff46955a4012532c67', // your App Secret
		'callbackURL' 	: 'http://localhost:3000/auth/facebook/callback'
	}
};
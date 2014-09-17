//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '270256063152691', // your App ID
		'clientSecret' 	: 'ebfd00a8dd374eff46955a4012532c67', // your App Secret
		'clientNamespace'	: 'Urbanopoly', // your App Namespace
		'callbackURL' 	: 'http://ec2-54-186-88-131.us-west-2.compute.amazonaws.com/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'your-consumer-key-here',
		'consumerSecret' 	: 'your-client-secret-here',
		'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}

};
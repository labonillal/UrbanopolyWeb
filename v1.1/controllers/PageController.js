/* GET cover page. */
exports.getCover = function(req, res) {
	res.render('cover', { title: 'Urbanopoly' });
};

/* GET Profile page. */
exports.getProfile = function(req, res){
	console.log('Executing: PageController.getProfile...');
	console.log('Sesion: %j', req.user);
	console.log('Express Sesion: %j', req.session);
	res.render('profile', { title: 'Profile', user_name: req.user.name });
};

/* GET My Venues page. */
exports.getVenues = function(req, res) {
	res.render('venues', { title: 'My Venues', user_name: req.user.name });
};

/* GET Map page. */
exports.getMap = function(req, res){
	res.render('map', { title: 'Map', user_name: req.user.name });
};

/* GET Leaderboard page. */
exports.getLeaderboard = function(req, res){
	res.render('leaderboard', { title: 'Leaderboard', user_name: req.user.name });
};

/* GET Notifications page. */
exports.getNotifications = function(req, res){
	res.render('notifications', { title: 'Notifications', user_name: req.user.name });
};

/* GET Tutorial page. */
exports.getTutorial = function(req, res){
	res.render('tutorial', { title: 'Tutorial', user_name: req.user.name });
};

/* GET Credits page. */
exports.getCredits = function(req, res){
	res.render('credits', { title: 'Credits', user_name: req.user.name});
};
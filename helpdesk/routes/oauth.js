var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth/oauth2');
var passport = require('passport');

router.route('/oauth2/token')
    .post(oauth2.isAuthenticated, oauth2.token2);

router.route('/userinfo')
    .get(oauth2.isLoggedIn, oauth2.info);

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
router.route('/auth/google').get( passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

//api/auth/google/callback
// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

router.route('/auth/google/callback').get(passport.authenticate( 'google',  {failureRedirect: '/login' }),
    function(req, res) {
        res.json(req.hd_profile);
    });

/*
router.get('/auth/google/callback', function(req, res, next) {
    res.render('hellouserg', { title: 'Express' });
});*/
module.exports = router;



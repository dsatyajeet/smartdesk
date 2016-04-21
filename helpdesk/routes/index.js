var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loginindex', { title: 'Express' });
});

router.get('/home', function(req, res, next) {
  res.render('index-trial', { title: 'Express' });
});

router.get('/gok', function(req, res, next) {
  res.render('hello_g_user', { title: 'Express' });
});


router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.get('/test1', function(req, res, next) {
  res.render('testrepeat', { title: 'Express' });
});

/* GET home page. */
router.get('/profile', function(req, res, next) {
  res.render('profile-page', { title: 'Express' });
});

module.exports = router;

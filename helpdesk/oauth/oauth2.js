/*jslint node: true */
'use strict';

/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize');
var passport = require('passport');
var utils = require('../util');
var User = require('../models/oauth/user');
var AccessToken = require('../models/oauth/accesstoken');
var UserService=require ('../service/userService');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

/**
 * Grant authorization codes
 *
 * The callback takes the `client` requesting authorization, the `redirectURI`
 * (which is used as a verifier in the subsequent exchange), the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a code,
 * which is bound to these values, and will be exchanged for an access token.
 */
server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
    console.log("Grant authorization codes");
}));

/**
 * Grant implicit authorization.
 *
 * The callback takes the `client` requesting authorization, the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a token,
 * which is bound to these values.
 */
server.grant(oauth2orize.grant.token(function (client, user, ares, done) {
    console.log("Grant implicit authorization.");
}));

/**
 * Exchange authorization codes for access tokens.
 *
 * The callback accepts the `client`, which is exchanging `code` and any
 * `redirectURI` from the authorization request for verification.  If these values
 * are validated, the application issues an access token on behalf of the user who
 * authorized the code.
 */
server.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
    console.log("Exchange authorization codes for access tokens.");
}));

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
//server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {
//console.log("Exchange user id and password for access tokens.");
//}));
server.exchange(oauth2orize.exchange.password(function (_client, _username, _password, _scope, done) {
    //Validate the user
    User.findOne({ username: _username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        // Make sure the password is correct
        user.verifyPassword(_password, function(err, isMatch) {
            if (err) {
                console.error('error in verifying password');
                return done(null, false);
            }

            // Password did not match
            if (!isMatch) {
                console.error('Password did not match');
                return done(null, false);
            }
            // Success
            console.log('User found: '+user);

            AccessToken.findOne({userId:user._id},function(err,existingToken){
                if(err){
                    return done(err);
                }
               // var accessToken=null;
                var refreshToken = "xx";
                if(!existingToken){
                    console.log('creating new token');
                    var token = utils.uid(50);
                    var accessToken =new AccessToken();
                    accessToken.value=token;
                    accessToken.googleToken=token;
                    accessToken.userId=user.id;
                    accessToken.save(function (err) {
                        if (err) {
                            return done(err);
                        }

                        //I mimic openid connect's offline scope to determine if we send
                        //a refresh token or not

                        return done(null, token, refreshToken, {expires_in: 3600});
                    });
                }
                else{
                    console.log('already exist');
                    return done(null, existingToken.value, refreshToken, {expires_in: 3601});
                }
            });
        });




    });

}));



/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(oauth2orize.exchange.clientCredentials(function (client, scope, done) {
    console.log("Exchange the client id and password/secret for an access token.");
}));

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    console.log("Exchange the refresh token for an access token.");
}));

/**
 * User authorization endpoint
 *
 * `authorization` middleware accepts a `validate` callback which is
 * responsible for validating the client making the authorization request.  In
 * doing so, is recommended that the `redirectURI` be checked against a
 * registered value, although security requirements may vary accross
 * implementations.  Once validated, the `done` callback must be invoked with
 * a `client` instance, as well as the `redirectURI` to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction.  It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization).  We accomplish that here by routing through `ensureLoggedIn()`
 * first, and rendering the `dialog` view.
 */
exports.authorization = ["temp hide"];

/**
 * Token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], {session: false}),
    server.token(),
    server.errorHandler()
];

//test
exports.token2 = [
    server.token(),
    server.errorHandler()
];

exports.info = [
    function (req, res) {
        console.log('test API: '+req.user.id);
       // var roleArray=['Admin','Customer'];
       UserService.validatUserByRoles(req.header('Authorization').split(' ')[1],['Customer'],generalCallback)
        // req.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`.  It is typically used to indicate scope of the token,
        // and used in access control checks.  For illustrative purposes, this
        // example simply returns the scope in the response.
        //res.json({user_id: req.user.id, name: req.user.username, scope: req.authInfo.scope});



        function generalCallback(err, obj, message, errorMessage) {
            console.log(' validate call :'+err);
            if (err) {
                renderError(err,req,res);
            }
            else {
                if (message) {
                    res.send(message);
                }
                else {
                    if (obj)
                        res.json(obj);
                    else {
                      //  res.send('success');
                        res.json({user_id: req.user.id, name: req.user.username, scope: req.authInfo.scope});
                    }
                }
            }
        }

    }
];

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function (client, done) {
    console.log("serializeClient");
    return done(null, client.id);
});


server.deserializeClient(function (id, done) {
    console.log("deserializeClient, impementation needed");
    return done(null, client);
});

exports.isAuthenticated = passport.authenticate(['basic', 'oauth2-client-password'], { session : false });

exports.isLoggedIn = passport.authenticate(['bearer'], { session : false });

function renderError(err, req, res, next) {
    console.log('custom error..oauth...'+err);
    res.status(err.status || 500);
    res.json({errorMessage: err.message});
}

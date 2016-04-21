var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/helpdesk');

var Client = require('../models/oauth/client');
var User = require('../models/oauth/user');
var Role = require('../models/oauth/role');


function addClient() {
    var client = new Client();

    client.name = 'helpdesk';
    client.id = 'ihelp';
    client.secret = 'isecret';
    client.userId = 'sample';

    // Save the client and check for errors
    client.save(function (err) {
        if (err)
            console.error("error in saving client: " + err);
        console.log('Client added to the locker! ' + client);
    });
};

function getClient(_userid) {
    var client2 = new Client();
    client2.id = 4;
    // Use the Client model to find all clients
    Client.find({userId: _userid}, function (err, client) {
        if (err)
            console.error(err);
        console.log('client received:' + client2.id);
    });
};


function getUser(_username, _password) {
    // Use the Client model to find all clients
    User.findOne({username: _username}, function (err, user) {
        if (err) {
            console.error('error in finding user: ' + err);
            return;
        }

        // No user found with that username
        if (!user) {
            console.error('No user found with that username: ' + _username);
            return;
        }

        // Make sure the password is correct
        user.verifyPassword(_password, function (err, isMatch) {
            if (err) {
                console.error('error in verifying password');
                return;
            }

            // Password did not match
            if (!isMatch) {
                console.error('Password did not match');
                return;
            }

            // Success
            console.log('User found: ' + user);
        });
    });
};

function findRoles(roles){
    Role.find()
        .where('name')
        .in(roles)
        .exec(function (err, records) {
            console.log(' record found '+records);
            console.log('total records: '+records.length);
        });
}

function addUserWithRole(username,mobile,rolesArray,fname,lname){
    Role.find()
        .where('name')
        .in(rolesArray)
        .exec(function (err, roles) {
            if(err){
                console.error('error in finding user.');
            }
            else{
                addUser(username,mobile,roles,fname,lname);
                console.log(' record found '+roles);
                console.log('total records: '+roles.length);
            }

        });
}

function addUser(_username,_mobile,roles,fname,lname) {
    var user=null;
    if(!roles){
    user = new User({
        username: _username,
        password: 'password',
        firstname:"firstname",
        lastname:"lastname",
        email:"email",
        mobile:"mobile"
    });}
    else{
        user = new User({
            username: _username,
            password: 'password',
            firstname:fname,
            lastname:lname,
            email:_username,
            mobile:_mobile,
            roles:roles
        });
    }
    console.log('b4 user save');
    user.save(function (err) {
        if (err)
            console.error('error in adding user: ' + err);
        else
            console.log('user added:' + user);
    });
    console.log('end');
}

function addRole(role) {
    var role = new Role({
        name: role,
        description: 'default decription'
    });
    console.log('b4 role save');
    role.save(function (err) {
        if (err)
            console.error('error in adding role: ' + err);
        else
            console.log('role added:' + role);
    });
    console.log('end');
}

function populateRole(uname){
    console.log(uname);
    User.findOne({username:uname}).populate('roles').exec(function(err, _roles){
        if(err){
            console.log('error in populate');
        }
        else{
            console.log('Role populated: '+_roles.roles[1]);
        }
    });
}
/*
addClient();
getClient('sample');
var uname = 'Veer';
console.log('adding user');
addUser(uname);
console.log('interval');
getUser(uname, 'password');
console.log('completed');
*/
//addRole('Customer');
//var rolearray=['Admin','Customer'];
//addUserWithRole('Dinanath',rolearray);
//addRole('Admin');
var rolearray=['Admin','Customer','Support'];
//findRoles(rolearray);
addUserWithRole('super@gmail.com',"89898988",rolearray,'Satyajeet',"Deshmukh");
//populateRole('Sonia');
//console.log(' next to populate..');
//populateRole('Mulayam');

//addClient();
//addRole('Admin');
//addRole('Customer');
//addRole('Support');
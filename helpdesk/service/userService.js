var User = require('../models/oauth/user');
var Role = require('../models/oauth/role');
var AccessToken = require('../models/oauth/accesstoken');
var RoleService = require('./roleService');
var CategoryService = require('./categoryService');
var utils = require('../util');
var UtilService=require('./utilService');
var async = require('async');
exports.validatUserByRoles = function (token, roleArray, callback, context) {
    console.log('in validate role:' + context + '  token: ' + token);
    AccessToken.findOne({value: token}, function (err, accessToken) {
        if (err) {
            return callback(context, err);
        }
        if (!(accessToken && accessToken.userId)) {
            return callback(context, new Error('Access token not found.'));
        }
        User.findById(accessToken.userId).populate({
            path: 'roles',
            match: {"name": {"$in": roleArray}}
        }).exec(err, function (err, userRoles) {
            console.log('valid user roles:' + userRoles);
            if (!(userRoles && userRoles.roles && userRoles.roles.length > 0)) {
                return callback(context, new Error('Access denied'));
            }
            return callback(context, null, null);
        });

    });
};

exports.validatUserByRoles2 = function (userId, roleArray, callback, context) {

    User.findById(userId).populate({
        path: 'roles',
        match: {"name": {"$in": roleArray}}
    }).exec(function (err, userRoles) {
        console.log(''+roleArray.length+'VALIDATE::::::'+userRoles+'.......>>'+userId);
        if (!(userRoles && userRoles.roles && userRoles.roles.length > 0)) {
            return callback(context, new Error('Access denied'));
        }
        console.log('user validated...');
        return callback(context, null, null);
    });
};


exports.getUserByToken = function (token, callback, context) {
    console.log('get user by token:cc ' + token);
    AccessToken.findOne({value: token}, function (err, accessToken) {
        if (err) {
            return callback(context, err);
        }
        if (!(accessToken && accessToken.userId)) {
            return callback(context, new Error('Access token not found.'));
        }
        User.findById(accessToken.userId).populate('roles').populate('supportType').exec(err, function (err, loadedUser) {
            if (!loadedUser) {
                return callback(context, new Error('User not found.'));
            }
            console.log('user found and context is: ' + context);
            return callback(context, null, loadedUser);
        });

    });
};

exports.validateSupportRole=function(callback,context,roles){
    validateSupportTypesForUserRoles_local(callback, context, roles);
};

exports.add2 = function (callback, context, username, password, email, firstname, lastname, mobile, roleArray, supportTypeId) {
    console.log('add firstName: ' + firstname);
    var userContext = {};
    userContext.parentCallback = callback;
    userContext.context = context;
    userContext.objectMap = [];
    var actionArray = [function findRoles(cb) {
        userContext.cb = cb;
        userContext.keyName = 'selected_roles';
        RoleService.getRoles(ticketServiceMapCallback, userContext, roleArray);
    }, function findCategory(cb) {
        userContext.cb = cb;
        userContext.keyName = 'selected_category';
        if (supportTypeId)
            CategoryService.getById(ticketServiceMapCallback, userContext, supportTypeId);
        else {
            cb(null);
        }
    }, function validateSupport(cb) {
        if (supportTypeId) {
            userContext.cb = cb;
            var v;
            userContext.keyName=v;
            validateSupportTypesForUserRoles_local(ticketServiceMapCallback, userContext, userContext.objectMap.selected_roles)
        } else {
            cb(null);
        }
    }
        , function addUser(cb) {
            userContext.cb = cb;
            userContext.keyName = 'added_user';
            console.log('###selected category: ' + userContext.objectMap.selected_category);
            addUser_local(ticketServiceMapCallback, userContext, username, password, email, firstname, lastname, mobile,
                userContext.objectMap.selected_roles, userContext.objectMap.selected_category);
        }, function returnFinalCallback(cb) {
            cb(null);
            return callback(context, null, userContext.objectMap.added_user);
        }];
    async.series(actionArray);
};


exports.register = function (callback, context, password, email, firstname, lastname, mobile,confirmPassword) {
    console.log('add firstName: ' + firstname);
    var userContext = {};
    userContext.parentCallback = callback;
    userContext.context = context;
    userContext.objectMap = [];
    var actionArray =
        [
            function checkPassword(cb) {
                if(password!=confirmPassword){
                    var err=new Error('Password -confirm password not match.')
                    cb(err);
                    return callback(context,err);
                }else{
                    cb(null);
                }
            },
            function findRoles(cb) {
            userContext.cb = cb;
            userContext.keyName = 'selected_roles';

            RoleService.getRoles(ticketServiceMapCallback, userContext, ['Customer']);
        }
        , function addUser(cb) {
            userContext.cb = cb;
            userContext.keyName = 'registered_user';
            console.log('###selected category: ' + userContext.objectMap.selected_category);
            addUser_local(ticketServiceMapCallback, userContext, email, password, email, firstname, lastname, mobile,
                userContext.objectMap.selected_roles);
        }, function returnFinalCallback(cb) {
            cb(null);
            return callback(context, null, userContext.objectMap.registered_user);
        }];
    async.series(actionArray);
};


exports.getUsersByCategoryId = function (callback, context,categoryId) {
    var userContext = {};
    userContext.parentCallback = callback;
    userContext.context = context;
    userContext.objectMap = [];
    var actionArray = [function findRoles(cb) {
        userContext.cb = cb;
        userContext.keyName = 'selected_roles';
        RoleService.getRoles(ticketServiceMapCallback, userContext, ['Support']);
    }, function findCategory(cb) {
        userContext.cb = cb;
        userContext.keyName = 'selected_category';
        console.log('category Id..BXB.'+categoryId);
            CategoryService.getById(ticketServiceMapCallback, userContext, categoryId);

    }, function findUsers(cb) {
            userContext.cb = cb;
            userContext.keyName = 'user_list';
            console.log('###selected category: ' + userContext.objectMap.selected_category);
        findUsersByCategory_local(ticketServiceMapCallback, userContext,
            userContext.objectMap.selected_roles, userContext.objectMap.selected_category);
        }, function returnFinalCallback(cb) {
        console.log('BXBstatus::');
            cb(null);
            return callback(context, null, userContext.objectMap.user_list);
        }];
    async.series(actionArray);
};

exports.update2 = function (callback, context, id, username, email, firstname, lastname, mobile, roleArray, supportTypeId) {
    var userContext = {};
    userContext.parentCallback = callback;
    userContext.context = context;
    userContext.objectMap = [];
    var actionArray = [function findRoles(cb) {
        userContext.cb = cb;
        userContext.keyName = 'selected_roles';
        console.log('role array: XX'+roleArray);
        RoleService.getRoles(ticketServiceMapCallback, userContext, roleArray);
    },
        function findCategory(cb) {
        console.log('XYX '+supportTypeId);
        if (supportTypeId){
            userContext.cb = cb;
            userContext.keyName = 'selected_category';
            console.log('XX support type id:'+supportTypeId);
            CategoryService.getById(ticketServiceMapCallback, userContext, supportTypeId);

        }
        else {
            cb(null);
        }
    },
        function validateSupport(cb) {
            if (supportTypeId) {
                userContext.cb = cb;
                var v;
                userContext.keyName=v;
                validateSupportTypesForUserRoles_local(ticketServiceMapCallback, userContext, userContext.objectMap.selected_roles)
            } else {
                cb(null);
            }
        }

        , function updateUser(cb) {
            userContext.cb = cb;
            userContext.keyName = 'updated_user';
            console.log('upated catagory:CDC'+userContext.objectMap.selected_category);
            updateUser_local(ticketServiceMapCallback, userContext, id, username, email, firstname, lastname, mobile,
                userContext.objectMap.selected_roles, userContext.objectMap.selected_category);
        }, function returnFinalCallback(cb) {
            cb(null);
            return callback(context, null, userContext.objectMap.updated_user);
        }];
    async.series(actionArray);
};


exports.get = function (username, callback, context) {
    console.log('context is: ' + context);
    User.findOne({username: username}).populate('roles').populate('supportType').exec(function (err, found) {
        if (err) {
            return callback(context, err);
        }
        else {
            if (!found) {

                return callback(context, new Error('User not found'));
            }
            console.log('user found..');
            return callback(context, null, found);
        }
    });
};

exports.getAll = function (callback, context) {
    User.find({}).populate('roles').exec(function (err, found) {
        if (err) {
            console.log('error in finding/populating all users:' + err);
            return callback(context, err);
        }
        else {
            if (!found) {

                return callback(context, new Error('Undefined user list after role population.'));
            }
            return callback(context, null, found);
        }
    });
};

exports.getById = function (userId, callback, context) {
    console.log('user get by idd:'+userId);
    User.findOne({_id: userId}).populate('roles').populate('supportType').exec(function (err, found) {
        if (err) {
            console.log('user get by id: '+err);
            return callback(context, err);
        }
        else {
            if (!found) {

                return callback(context, new Error('User not found'));
            }
            return callback(context, null, found);
        }
    });
};


exports.getGroupMembers=function(callback,context,category){
    User.find({supportType:category},function(err,list){
        if(err){
            return callback(context,err);
        }
        for(var i=0;i<list.length ; i++){
            console.log('user name: '+list[i].email);
        }
        return callback(context,null,list);
    });
}



exports.mapUser2 = function (callback, context, password, email, firstname, lastname, mobile) {
    console.log('add firstName: ' + firstname);
    var userContext = {};
    userContext.parentCallback = callback;
    userContext.context = context;
    userContext.objectMap = [];
    var actionArray =
        [
            function findUser(cb) {
                userContext.cb = cb;
                userContext.keyName = 'g_user';
                getUserByName_local(ticketServiceMapCallback,userContext,email);
            },
            function findSupportRole(cb) {
                userContext.cb = cb;
                userContext.keyName = 'support_role';
                RoleService.getRoles(ticketServiceMapCallback, userContext, ['Customer']);
            }
            , function addUser(cb) {
            userContext.cb = cb;
            if(!userContext.objectMap.g_user){
                userContext.keyName = 'g_user';
                addUser_local(ticketServiceMapCallback, userContext, email, password, email, firstname, lastname, mobile,
                    userContext.objectMap.support_role);
            }
            else{
                cb(null);
            }
        }, function getToken(cb){
            userContext.cb = cb;
            userContext.keyName = 'g_token';
            getOrGenerateAccessToken_local(ticketServiceMapCallback,userContext,userContext.objectMap.g_user._id);
        },
            function returnFinalCallback(cb) {
            cb(null);
            return callback(context, null, userContext.objectMap.g_token);
        }];
    async.series(actionArray);
};


function validateSupportTypesForUserRoles_local(callback, context, roles) {
    console.log('valid roles##'+roles);
    if (roles) {
        for (var i = 0; i < roles.length; i++) {
            if (roles[i].name == 'Support')
            return callback(context, null, null);
        }
    }
    return callback(context, new Error('Roles not supported to assign support category.'));
}

function addUser_local(callback, context, username, password, email, firstName, lastName, mobile, roles, supportType) {
    var user = null;
    if (!roles) {
        user = new User({
            username: username,
            password: password,
            email: email,
            firstName: firstName,
            lastName: lastName,
            mobile: mobile
        });
    }
    else {
        user = new User({
            username: username,
            password: password,
            roles: roles,
            supportType: supportType,
            email: email,
            firstname: firstName,
            lastname: lastName,
            mobile: mobile
        });
    }
    console.log('b4 user save');
    user.save(function (err) {
        if (err) {
            console.error('error in adding user: ' + err);
            callback(context, err);
        }
        else {
            console.log('user added:' + user);
            callback(context, null, user);
        }
    });
}


function findUsersByCategory_local(callback, context, roles, category) {
    User.find({supportType:category}).where('roles').in(roles).exec(function(err,list){
        if(err) {
            return callback(context, err);
        console.log('BXBerror:'+err);
        }
        console.log('BXBlistlength'+list.length);
        console.log('BXBCONTEXT: '+context);
        return callback(context,null,list);
    });
}


/*
 function updateUser(id, username, email, firstname, lastname, mobile, roles, callback, context) {
 console.log('going to update--' + id + ' username:' + username);
 User.findByIdAndUpdate(id, {
 username: username,
 email: email,
 firstname: firstname,
 lastname: lastname,
 mobile: mobile,
 roles: roles
 }, function (err, userUpdated) {
 console.log('update status: ' + err + '    update user: ' + userUpdated);
 if (err) return callback(context, err);

 User.findById(id, function (err, found) {
 if (err) return callback(context, err);
 return callback(context, null, found);
 })
 });
 }*/
function updateUser_local(callback, context, id, username, email, firstname, lastname, mobile, roles, supportType) {
    console.log('going to update--' + id + ' username:' + username);
    User.findByIdAndUpdate(id, {
        username: username,
        email: email,
        firstname: firstname,
        lastname: lastname,
        mobile: mobile,
        roles: roles,
        supportType: supportType
    }, function (err, userUpdated) {
        console.log('update status: ' + err + '    update user: ' + userUpdated);
        if (err) return callback(context, err);

        User.findById(id, function (err, found) {
            if (err) return callback(context, err);
            return callback(context, null, found);
        })
    });
}


function ticketServiceMapCallback(ticketContext, err, resObj) {
    if (err) {
        ticketContext.cb(err);
        return ticketContext.parentCallback(ticketContext.context, err, null);
    }
    console.log('PPX key name:' + ticketContext.keyName);
    console.log('PPX key value:' + resObj);
    if (ticketContext.keyName) {
        ticketContext.objectMap[ticketContext.keyName] = resObj;
    }
    ticketContext.cb(null);
    //return ticketContext.parentCallback(ticketContext.context,null,ticketContext.resObj);
}

function getUserByName_local(callback,context,username){
    User.findOne({username: username}).populate('roles').populate('supportType').exec(function (err, found) {
        if (err) {
            return callback(context, err);
        }
        else {
            console.log('user found..');
            return callback(context, null, found);
        }
    });

}

function getOrGenerateAccessToken_local(callback,context,userId){
    AccessToken.findOne({userId:userId},function(err,existingToken){
        if(err){
            return callback(context,err);
        }
        if(!existingToken){
            console.log('creating new token');
            var token = utils.uid(50);
            var accessToken =new AccessToken();
            accessToken.value=token;
            accessToken.userId=userId;
            accessToken.save(function (err) {
                if (err) {
                    return callback(context,err);
                }
                return callback(context,null,accessToken);
            });
        }
        else{
            console.log('already exist');
            return callback(context,null,existingToken);
        }
    });
}
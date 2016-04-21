/**
 * Created by satyajeet on 11/12/15.
 */
var Category = require('../models/category');

exports.addCategory = function (callback, context, id,name) {
    var category=new Category();
    category.categoryId=id;
    category.name=name;
    category.save(function(err){
        if(err){
            return callback(context,err);
        }
        return callback(context,null,category);
    });
}

exports.getById=function(callback,context,id){
    console.log('CORE ID:'+id);
    Category.findOne({categoryId:id},function (err,found){
        if(err){
            return callback(context,err);
        }
        console.log('CORE FOUND:'+found);
        return callback(context,null,found);
    });

};

exports.getByName=function(callback,context,name){
    Category.findOne({name:name},function (err,found){
        if(err){
            return callback(context,err);
        }
        return callback(context,null,found);
    });
};

exports.all=function(callback,context){
    Category.find({},function(err,found){
        if(err){
            return callback(context,err);
        }
        return callback(context,null,found);
    })
}
/**
 * Created by satyajeet on 11/12/15.
 */
var Status = require('../models/status');

exports.add = function (callback, context, id,name) {
    var status=new Status();
    status.statusId=id;
    status.name=name;
    status.save(function(err){
        if(err){
            return callback(context,err);
        }
        return callback(context,null,status);
    });
}



exports.getById=function(callback,context,id){
    console.log('CORE ID:'+id);
    Status.findOne({statusId:id},function (err,found){
        if(err){
            return callback(context,err);
        }
        console.log('CORE FOUND:'+found);
        return callback(context,null,found);
    });

};

exports.all=function(callback,context){
    Status.find({},function(err,found){
        if(err){
            return callback(context,err);
        }
        return callback(context,null,found);
    })
}

exports.sortedAll=function(callback,context){
    Status.find({}).sort({"statusId":1}).exec(function(err,found){
        if(err){
            return callback(context,err);
        }
        return callback(context,null,found);
    })
}

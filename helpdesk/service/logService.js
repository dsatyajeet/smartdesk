/**
 * Created by satyajeet on 22/12/15.
 */
var User = require('../models/oauth/user');
var Role = require('../models/oauth/role');
var Ticket = require('../models/ticket');
var UserService = require('../service/userService');
var CategoryService = require('../service/categoryService');
var StatusService = require('../service/statusService');
var TicketService = require('../service/ticketService');
var UtilService = require('./utilService');

var StatusLog = require('../models/statuslog');
var TicketAssignedLog = require('../models/ticketassignlog');
var async = require('async');
//Status Log ...

exports.getLogs = function (callback, context, ticketId) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    ticketContext.objectMap['mergeData'] = [];
    var actionArray = [
        function findTicket(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket';
            TicketService.getById(UtilService.serviceMapCallback, ticketContext, ticketId);
        },
        function loadAssignedLogs(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assigned_logs';
            getTicketAssignedLog_local(UtilService.serviceMapCallback, ticketContext, ticketContext.objectMap.ticket);
        },
        function loadAndMergeTopStatus(cb) {
            console.log('ASSIGNED LENGTH:>>'+ticketContext.objectMap.assigned_logs.length);
            ticketContext.cb = cb;
            ticketContext.keyName = '_pre';
            getTopStatusLog_local(logCallback, ticketContext, ticketContext.objectMap.ticket, ticketContext.objectMap.assigned_logs[0].statusLog.logIndex);
        },
        function loadAndMergeIntermediateStatus(cb) {
            ticketContext.cb = cb;
            var v;
            ticketContext.keyName = v;
            getContinuesIntermediateStatusLog_local(UtilService.serviceMapCallback, ticketContext,
                ticketContext.objectMap.ticket, ticketContext.objectMap.assigned_logs);

        },
         function loadAndMergeRearStatus(cb) {
         ticketContext.cb = cb;
         ticketContext.keyName = 'assigned_logs';
             var assignLength=ticketContext.objectMap.assigned_logs.length;
             getRearStatusLog_local(logCallback,ticketContext,ticketContext.objectMap.ticket,
                 ticketContext.objectMap.assigned_logs[(assignLength-1)].statusLog.logIndex)
         },
        function returnFinalCallback(cb) {
            console.log('in final mode..');
            var finalData={};
            finalData.flows=ticketContext.objectMap.mergeData;
            return ticketContext.parentCallback(ticketContext.context, null, finalData);
        }];
    async.series(actionArray);
}


function getTopStatusLog_local(callback, context, ticket, rearLogIndex) {
    console.log('RER-log-index:' + rearLogIndex);
    StatusLog.find({ticket: ticket}).where('logIndex').lte(rearLogIndex).sort({"logIndex": 1}).populate('changedBy status').exec(function (err, obj) {
        if (err) {
            return callback(context, err);
        }
        else {
            return callback(context, null, obj);
        }
    });

}

function getRearStatusLog_local(callback, context, ticket, topLogIndex) {
    console.log('Max tkt find: ' + ticket);
    StatusLog.find({ticket: ticket}).where('logIndex').gt(topLogIndex).sort({"logIndex": 1}).populate('changedBy status').exec(function (err, obj) {
        if (err) {
            return callback(context, err);
        }
        else {
            return callback(context, null, obj);
        }
    });

}

function getIntermediateStatusLog_local(callback, context, ticket, topLogIndex, rearLogIndex) {
    StatusLog.find({ticket: ticket}).where('logIndex').gt(topLogIndex).lte(rearLogIndex).sort({"logIndex": 1}).
        populate('changedBy status').exec(function (err, obj) {
            if (err) {
                return callback(context, err);
            }
            else {
                if(!obj){
                    console.log('UNDEFINED::top '+topLogIndex+'  rear:'+rearLogIndex);
                }
                return callback(context, null, obj);
            }
        });
}

function getContinuesIntermediateStatusLog_local(callback, context, ticket, assignLogs) {
    console.log('I AM ON');
    var count = 0;
    var topLogIndex;
    var rearLogIndex;
    var localContext = {};
    localContext.parentCallback = callback;
    localContext.context = context;
    localContext.objectMap = [];

    var parentActionArray = [
        function (cb) {
            localContext.cb = cb;
            localContext.objectMap = [];
            var mergedData = localContext.context.objectMap['mergeData'];
            localContext.objectMap.mergeData = mergedData;
            //var partialAssigns = [];
            initAssignDataRow_local(mergedData,assignLogs[(count - 1)]);
            //partialAssigns.push(assignLogs[(count - 1)]);
            var i = count;
            /*  async.whilst(
             function () {
             return (i<assignLogs.length);
             },
             function (cb) {

             i++;
             },
             function (err) {
             console.log('error in nested whlist'+err);
             //return callback(context,err);
             // 5 seconds have passed
             }
             )*/

            //for(var i=count;i<assignLogs.length;i++){
            async.whilst(function () {
                    var flag=(count < (assignLogs.length-1));
                    console.log('THE FLAG :'+flag);
                    return flag;
                },
                function (cb) {
                    count++;
                    var innerContext = {};
                    innerContext.cb = cb;
                    innerContext.objectMap = [];
                    innerContext.objectMap.mergeData = localContext.objectMap.mergeData;

                    topLogIndex = assignLogs[(count - 1)].statusLog.logIndex;
                    rearLogIndex = assignLogs[count].statusLog.logIndex;
                    if (topLogIndex == rearLogIndex) {
                        var currentLength=innerContext.objectMap.mergeData.length;
                        if(currentLength>1){
                            var currentData=innerContext.objectMap.mergeData[(currentLength-1)];
                            if(currentData.type=='assign'){
                                currentData.data.push(assignLogs[count]);
                            }
                            else{
                                dd
                                return;

                                initAssignDataRow_local(mergedData,assignLogs[count]);
                            }
                        }
                        cb(null);
                    }
                    else {
                        //load statuslogs from < top to <= rear.
                        innerContext.objectMap.assignRow = assignLogs[count];

                        getIntermediateStatusLog_local(logCallback2, innerContext, ticket, topLogIndex, rearLogIndex);
                    }

                }, function (err) {
                    console.log('THE END');
                    return callback(context,null);
                })


        }];

async.series(parentActionArray);
}


function getContinuesIntermediateStatusLog_localBKP(callback, context, ticket, assignLogs) {
    console.log('I AM ON');
    var count2 = 1;
    var count = count2;
    var topLogIndex;
    var rearLogIndex;
    var localContext = {};
    localContext.parentCallback = callback;
    localContext.context = context;
    localContext.objectMap = [];
    var rotateCount = 0;
    localContext.rotateCount = rotateCount;

    async.whilst(
        function () {
            var flag = ( count2 < (assignLogs.length - 1));
            console.log('condition>>' + count + ' length:' + assignLogs.length + '   flag:' + flag);
            return flag;
        },
        function (cb) {
            rotateCount++;
            localContext.rotateCount = rotateCount;
            console.log('Rotate count:' + rotateCount);
            count = count2;
            localContext.cb = cb;
            localContext.objectMap = [];
            var mergedData = localContext.context.objectMap['mergeData'];
            localContext.objectMap.mergeData = mergedData;
            var partialAssigns = [];

            partialAssigns.push(assignLogs[(count - 1)]);
            var i = count;
            /*  async.whilst(
             function () {
             return (i<assignLogs.length);
             },
             function (cb) {

             i++;
             },
             function (err) {
             console.log('error in nested whlist'+err);
             //return callback(context,err);
             // 5 seconds have passed
             }
             )*/

            for (var i = count; i < assignLogs.length; i++) {
                count2 = i;
                topLogIndex = assignLogs[(i - 1)].statusLog.logIndex;
                rearLogIndex = assignLogs[i].statusLog.logIndex;
                if (topLogIndex == rearLogIndex) {
                    partialAssigns.push(assignLogs[(count)]);
                }
                else {
                    var dataConfig = {};
                    dataConfig.type = 'assign';
                    dataConfig.data = partialAssigns;
                    mergedData.push(dataConfig);
                    //load statuslogs from < top to <= rear.
                    var actionArray = [function getInterLogs(cb) {

                        getIntermediateStatusLog_local(logCallback2, localContext, ticket, topLogIndex, rearLogIndex);
                    }];
                    async.series(actionArray);
                }
            }


        },
        function (err) {
            console.log('error in whlist' + err);
            return callback(context, null);
            //return callback(context,err);
            // 5 seconds have passed
        }
    );


}

function getTicketAssignedLog_local2(callback, context, ticket) {
    TicketAssignedLog.find({ticket: ticket}).where('logIndex').gte(2).sort({"logIndex": 1}).exec(function (err, doc) {
        if (err) {
            return callback(context, err);
        }
        return callback(context, null, doc);
    });
}


function getTicketAssignedLog_local(callback, context, ticket) {
    TicketAssignedLog.find({ticket: ticket}).sort({"logIndex": 1}).populate('statusLog assignedTo assignedBy').exec(function (err, doc) {

        if (err) {
            return callback(context, err);
        }
        TicketAssignedLog.populate(doc, {path: 'statusLog.status', model: 'Status'},
            function (err, data) {
                if (err) {
                    return callback(context, err);
                }
                /*
                 var count = 0;
                 var statusLogTop;
                 var statusLogRear;
                 var mergeData=[];

                 async.whilst(
                 function () { return count < data.length; },
                 function (callback) {
                 statusLogTop=data[count].statusLog.logIndex;
                 count++;
                 setTimeout(callback, 1000);
                 },
                 function (err) {

                 }
                 );


                 for(var i=0;i<data.length;i++){
                 console.log(data[i].logIndex+'###LOGINDEXLOGINDEX###'+data[i].statusLog.logIndex);


                 }*/
                return callback(context, null, data);
            });

    });
}


function logCallback(serviceContext, err, resObj) {
    if (err) {
        serviceContext.cb(err);
        return serviceContext.parentCallback(serviceContext.context, err, null);
    }
    console.log('service-callback-key-name:' + serviceContext.keyName);
    var dataConfig = {};
    dataConfig.type = 'status';
    dataConfig.data = resObj;
    serviceContext.objectMap['mergeData'].push(dataConfig);
    //console.log('#####b4cb-null');
    serviceContext.cb(null);
}
function logCallback2(serviceContext, err, resObj) {
    if (err) {
        serviceContext.cb(err);
        return serviceContext.parentCallback(serviceContext.context, err, null);
    }
    console.log('service-callback-key-name:' + serviceContext.keyName);
    var dataConfig = {};
    dataConfig.type = 'status';
    dataConfig.data = resObj;
    if(!resObj){
        console.log('UNDEFX');
    }
    console.log('INDXCL: '+resObj.length);
    serviceContext.objectMap['mergeData'].push(dataConfig);
    initAssignDataRow_local(serviceContext.objectMap['mergeData'],serviceContext.objectMap.assignRow);
    console.log('####local-count:' + serviceContext.rotateCount);
    serviceContext.cb(null);
}

function initAssignDataRow_local(mergedData,dataRow){
    var dataConfig = {};
    dataConfig.type = 'assign';
    dataConfig.data = [];
    dataConfig.data.push(dataRow);
    mergedData.push(dataConfig);
}
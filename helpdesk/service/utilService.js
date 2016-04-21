exports.generalSyncCallback = function (context, err, resultObj, message) {
    console.log('ROUTBXB::: '+resultObj);
    if (err) {
        renderError(err, context.request, context.response);
        if(context.callback)
            context.callback(err);
    }
    else {
        if (message) {
            context.response.send(message);
        }
        else {
            if (resultObj)
                context.response.json(resultObj);
        }
        if(context.callback)
            context.callback(null);
    }
}

exports.setUserSyncCallback = function (context, err, resultObj, message) {
    if (err) {
        renderError(err, context.request, context.response);
        if (context.callback)
            context.callback(err);
    }
    else {
        console.log('result is: '+resultObj);
        console.log('contect in user util: '+context);
        context.thisUser=resultObj;
        if(context.callback)
            context.callback(null);

    }
}

exports.serviceMapCallback= function(serviceContext, err, resObj) {
    if (err) {
        serviceContext.cb(err);
        return serviceContext.parentCallback(serviceContext.context, err, null);
    }
    console.log('service-callback-key-name:' + serviceContext.keyName);
    serviceContext.objectMap[serviceContext.keyName] = resObj;
    serviceContext.cb(null);
}

exports.getNewServiceContext=function(parentCallback,parentContext){
    var serviceContext = {};
    serviceContext.parentCallback = parentCallback;
    serviceContext.context = parentContext;
    serviceContext.objectMap = [];
    return serviceContext;
}

function renderError(err, req, res, next) {
    console.log('custom error..utilservice' + err);
    res.status(err.status || 500);
    res.json({errorMessage: err.message});
}

exports.getContext=function(req,res,cb,user){
    var context={};
    context.request=req;
    context.response=res;
    context.callback=cb;
    context.thisUser=user;
    return context;
}
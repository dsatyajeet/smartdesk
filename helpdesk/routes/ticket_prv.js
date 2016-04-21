/**
 * Created by keyurvekariya on 11/27/15.
 */

var Ticket = require('../models/ticket');
var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth/oauth2');

/* POST Ticket Add listing. */
router.route('/add').post(oauth2.isLoggedIn, function(req, res, next) {
    oauth2.isLoggedIn
    Ticket.create({
        subject: req.body.subject,
        content: req.body.content,
        createDate: new Date(),
        updateDate: new Date()
    }, function(err,ticket) {
        if (err)
            res.send(err);
        //res.send("added successfully");
        res.json(ticket);
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('ticket', { title: 'Express' });
});

/* GET home page. */
router.get('/tickets', function(req, res, next) {
    res.render('tickets', { title: 'Express' });
});


/* GET Ticket  listing. */
router.route('/get/:ticketId').get(oauth2.isLoggedIn, function(req, res, next) {

    Ticket.find({ "_id": req.params.ticketId }, function(err, ticket) {
        if (err) res.send(err);
        res.json(ticket);
    });
});


/* GETAll Ticket  listing. */
router.route('/getAll').get(oauth2.isLoggedIn, function(req, res, next) {

    Ticket.find({}, function(err, tickets) {
        if (err) res.send(err);
        res.json(tickets);
    });
});

/* PUT Ticket Update listing. */
router.route('/update').put(oauth2.isLoggedIn, function(req, res, next) {

    Ticket.findOneAndUpdate({_id: req.body.ticketId}, { subject: req.body.subject,content: req.body.content,updateDate:new Date() }, function(err, ticket) {
        if (err) res.send(err);
        // we have the updated user returned to us
        Ticket.find({ "_id": req.body.ticketId }, function(err, ticket) {
            if (err) res.send(err);
            res.json(ticket);
        });
    });


});

/* delete Ticket  listing. */
router.route('/delete/:ticketId').delete(oauth2.isLoggedIn, function(req, res, next) {

    Ticket.findOneAndRemove({ _id: req.params.ticketId }, function(err) {
        if (err)  res.send(err);
        res.send('Ticket Deleted Successfully!!!!');
    });
});



module.exports = router;

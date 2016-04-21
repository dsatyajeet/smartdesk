var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testmny');
var userDAO=require('../service/userService');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// avoid forward referencing
var PackageSchema = new Schema();
var FlashcardSchema = new Schema();

PackageSchema.add({
    id          : ObjectId,
    title       : { type: String, required: true },
    flashcards  : [ {type:ObjectId,ref:'Flashcard'} ]
});

FlashcardSchema.add({
    id      : ObjectId,
    type        : { type: String, default: '' },
    story       : { type: String, default: '' },
    packages    : [ {type:ObjectId,ref:'Package'} ]
});

var MyPackage= mongoose.model('Package', PackageSchema);
var MyCard=mongoose.model('Flashcard', FlashcardSchema);

// Exports both types
module.exports = {
    Package:   mongoose.model('Package', PackageSchema),
    Flashcard: mongoose.model('Flashcard', FlashcardSchema)
};

function addCard(type,story){
    var myCard1=new MyCard();

    myCard1.type=type;
    myCard1.story=story;

    myCard1.save(function(err,card){
        if(err)console.error("error in saving card");
        console.log('card saved');
    });

}

function findCardsbyType(type){
    MyCard.find({type:type},function(err,cards){
        if(err)console.error("error in finding card");
        console.log('card found'+cards);
        var myPackage1=new MyPackage();
        myPackage1.title="awesome";
        myPackage1.flashcards=cards;
        myPackage1.save(function(err,pack){
            if(err)console.error("error in saving pack");
            console.log('package saved');
        });
    });

}

function findPackage()
{
    MyCard.findOne({type: 'debit'}, function (err, card) {
        if (err)console.error("error in finding card");
        console.log('card found');
        var myPackage1 = new MyPackage();
        myPackage1.title = "hello title1";
        myPackage1.flashcards.push(card);
        myPackage1.save(function (err, pack) {
            if (err)console.error("error in saving pack");
            console.log('package saved');
        });
    });

    MyPackage.findOne({title: 'hello title1'}).populate('flashcards').exec(function (err, cards) {
        if (err) {
            console.log('error in populate')
        }
        console.log('found: ' + cards.flashcards);
    });
}

function findByInn(){
    MyCard.find()
        .where('type')
        .in(['type1', 'debit'])
        .exec(function (err, records) {
            console.log(' record found '+records);
            console.log('total records: '+records.length);
        });
}
//addCard('type1','story1');
//addCard('type1','story2');
//findCardsbyType('type1');
//findByInn();
userDAO.add();
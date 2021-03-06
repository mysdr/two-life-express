var express = require('express');
var router = express.Router();
var UserModel = require('../models').User;
var NoteModel = require('../models').Note;
var sha1 = require('sha1');
var md5 = require('md5');
var MESSAGE = require('./config').MESSAGE;
var KEY = require('./config').KEY;
var log = require('./config').log;

/* notes/save */
router.post('/save', function (req, res, next) {

    var timestamp = new Date().getTime();
    console.log('req.body.note_title: ' + req.body.note_title)
    console.log('req.body.note_content: ' + req.body.note_content)
    console.log('req.body.note_date: ' + req.body.note_date)

    console.log('req.body.note_location: ' + req.body.note_location)
    console.log('req.body.note_images: ' + req.body.note_images)

    if (req.body.uid == undefined || req.body.uid == ''
        || req.body.token == undefined || req.body.token == ''
        || req.body.timestamp == undefined || req.body.timestamp == ''
        || req.body.note_title == undefined || req.body.note_title == ''
        || req.body.note_content == undefined || req.body.note_content == ''
        || req.body.note_date == undefined || req.body.note_date == ''
        || req.body.note_location == undefined || req.body.note_location == ''
        || req.body.note_longitude == undefined || req.body.note_longitude == ''
        || req.body.note_latitude == undefined || req.body.note_latitude == ''
        || req.body.note_images == undefined || req.body.note_images == '') {
        res.json({status: 1, msg: MESSAGE.PARAMETER_ERROR});
        return;
    }

    log('notes/save');

    var note = {
        note_title: new Buffer(req.body.note_title).toString('base64'),
        note_content: new Buffer(req.body.note_content).toString('base64'),
        note_date: req.body.note_date,
        note_location: req.body.note_location,
        note_longitude: req.body.note_longitude,
        note_latitude: req.body.note_latitude,
        note_images: req.body.note_images
    };
    UserModel.findOne({
        where: {
            id: req.body.uid
        }
    }).then(function (user) {
        user.createNote(note);
        res.json({status: 0, msg: MESSAGE.SUCCESS});
    });
});

/* notes/delete */
router.post('/delete', function (req, res, next) {

    var timestamp = new Date().getTime();

    if (req.body.uid == undefined || req.body.uid == ''
        || req.body.token == undefined || req.body.token == ''
        || req.body.timestamp == undefined || req.body.timestamp == ''
        || req.body.note_id == undefined || req.body.note_id == '') {
        res.json({status: 1, msg: MESSAGE.PARAMETER_ERROR});
        return;
    }

    log('notes/delete');

    NoteModel.destroy({
        where: {
            id: req.body.note_id
        }
    }).then(function() {
        res.json({status: 0, msg: MESSAGE.SUCCESS})
        return;
    })
});

/* notes/show */
router.post('/show', function (req, res, next) {

    var timestamp = new Date().getTime();

    if (req.body.uid == undefined || req.body.uid == ''
        || req.body.token == undefined || req.body.token == ''
        || req.body.timestamp == undefined || req.body.timestamp == ''
        || req.body.user_id == undefined || req.body.user_id == ''
        || req.body.sex == undefined || req.body.sex == '') {
        res.json({status: 1, msg: MESSAGE.PARAMETER_ERROR});
        return;
    }

    log('notes/show');

    var whereCondition = {userId: req.body.uid};

    if (req.body.user_id !== -1) {
        whereCondition = {userId: [req.body.uid, req.body.user_id]}
    }

    var my_sex = req.body.sex == 0? 'male': 'female';
    var partner_sex = req.body.sex == 0? 'female': 'male';

    NoteModel.findAll({
        include: [UserModel],
        where: whereCondition
    }).then(function(result) {
        var notes = [];
        var user = {};

        result.forEach(function (note) {
            var noteData = {};
            noteData.note_id = note.id;
            noteData.note_title = note.note_date < 1497780516378 ? note.note_title : new Buffer(note.note_title, 'base64').toString();
            noteData.note_content = note.note_date < 1497780516378 ? note.note_content : new Buffer(note.note_content, 'base64').toString();
            noteData.note_date = note.note_date;
            noteData.note_location = note.note_location;
            noteData.note_images = note.note_images;
            
            note.user.id == req.body.uid ? noteData.male = my_sex : noteData.male = partner_sex;
            note.user.id == req.body.uid ? noteData.me = 'yes' : noteData.me = 'no';
            notes.push(noteData);
        });
        res.json({status: 0, data: notes, msg: MESSAGE.SUCCESS});
    }).catch(next);

    return;
});


module.exports = router;

/** IMPORTS **/
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

/** GLOBAL **/
var TAG = '[server]';
// Instatiate express app
var app = express();

// storage engine for multer
var storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        var filename = path.basename(file.originalname, ext);
        callback(null, filename + '_' + Date.now() + ext);
    }
});

// Multer uploader settings
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true);
    },
    limits: { fileSize: 10000000 } // 10 MB
}).single('file');

// Serve the public directory
app.use(express.static('public'));

// Route to handle file uploads
app.post('/upload', function (req, res) {
    // store using Multer
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            console.log('Error uploading file');
            res.sendStatus(500);
        }
        else {
            console.log('File stored in:', req.file.path);
            // Return the filename to the client
            res.status(200).send(path.basename(req.file.path));
        }
    });
});

// Route to handle file downloads
app.get('/:filename', function (req, res) {
    var filepath = path.join('uploads', req.params.filename);
    console.log('Received GET request for file:', filepath);
    res.sendFile(path.resolve(filepath));
})

// Start server
var server = app.listen(8765, function () {
    console.log(TAG, `listening on port ${server.address().port}`);
});


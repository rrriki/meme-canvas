const path = require('path');
const express = require('express');
const multer = require('multer');

// Instatiate express app
const app = express();
const port = 8080;
const maxFileSize = 10000000; // 10 MB

// storage engine for multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        const filename = path.basename(file.originalname, ext);
        callback(null, filename + '_' + Date.now() + ext);
    }
});

// Multer uploader settings
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
            return callback(new Error('Only images are allowed!'));
        }
        callback(null, true);
    },
    limits: { fileSize: maxFileSize }
}).single('file');

// Serve the public directory
app.use(express.static('public'));

// Route to handle file uploads
app.post('/upload', function (req, res) {
    // store using Multer
    upload(req, res, function (err) {
        const filePath = path.basename(req.file.path);
        console.log('POST:', filePath);
        if (err) {
            console.log('Error uploading file');
            console.log(err);
            return res.sendStatus(500);
        }

        // Return the filename to the client
        return res.status(200).send(filePath);
    });
});

// Route to handle file downloads
app.get('/:filename', function (req, res) {
    const { filename } = req.params;
    const filepath = path.join('uploads', filename);
    console.log('GET:', filename);
    return res.sendFile(path.resolve(filepath));
})

// Start server
const server = app.listen(port, function () {
    console.log(`listening on port ${server.address().port}`);
});


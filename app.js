const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Video = require('./models/Video');
const exp = require('constants');
const { title } = require('process');
const { describe } = require('node:test');

const app = express();

mongoose.connect('mongodb://localhost/video_site', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const video = new Video({
            title: req.body.title,
            description: req.body.description,
            videoPath: req.file.filename,
            uploadedBy: req.body.uploadedBy,
        });

        await video.save();
        res.send('動画がアップロードされました。');
    }  catch (err) {
        res.status(500).send('アップロードエラー');
    }
});

app.get('/video', async (req, res) => {
    try {
        const videos =await Video.find();
        res.json(videos);
    }   catch (err) {
        res.status(500).send('エラー');
    }
});

app.get('/video/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        const extname = path.extname(video.videoPath);
        const mimeType = extname === '.mp4' ? 'video/mp4' : extname === '.webm' ? 'video/webm' : 'video/ogg';

        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${video.title}</title>
                </head>
                <body>
                    <h1>${video.title}</h1>
                    <video controls>
                        <source src="/uploads/${path.basename(video.videoPath)}" type="video/mp4">
                        Your browser dose not support the video tag.</source>
                    </video>
                    <p>${video.description}</p>
                    <form action="/video/${video._id}/like" method="POST">
                      <button type="submit">いいね (${video.likes})</button>
                    </form>
                </body>
            </html>
            `);


    } catch (err) {
        res.status(404).send('動画が見つかりません。');
    }
});

app.post('/video/:id/like', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        video.likes++;
        await video.save();
        res.redirect('/video/${video._id}');
    } catch (err) {
        res.status(500).send('エラー');
    }
});

app.post('/video/:id/comment', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        video.comments.push({
            user: req.body.user,
            text: req.body.text,
        });
        await video.save();
        res.redirect(`/video/${video._id}`);
    }   catch (err) {
        res.status(500).send('コメントエラー');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
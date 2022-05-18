const express = require('express');
const app = express();
const multer = require('multer');
const { s3Uploadv2 } = require('./s3Service');
const uuid = require('uuid').v4;
require('dotenv').config();

// const upload = multer({dest: 'uploads/' });
// upload single file - upload.single(field)
// app.post("/upload", upload.single('file'), (req, res) => {
//     res.json({ status: "success" });
// });

// const upload = multer({dest: 'uploads/' });
// multiple file uploads - second argument is how many are aloud to be uploaded
// app.post("/upload", upload.array('file', 2), (req, res) => {
//     res.json({ status: "success" });
// });

// multiple fields upload
// const upload = multer({dest: 'uploads/' });

// const multiUpload = upload.fields([
//     {name: "avatar", maxCount: 1}, 
//     {name: "resume", maxCount: 1}
// ]);
// app.post("/upload", multiUpload, (req, res) => {
//     console.log(req.files);
//     res.json({ status: "success" });
// });

// custom filename

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads");
//     },
//     filename: (req, file, cb) => {
//         const { originalname } = file;
//         cb(null, `${uuid()}-${originalname}`);
//         // uuid-originalName
//     },
// });

// store file into memory storage to prepare for aws S3 
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    // if (file.mimetype === 'image/jpeg')
    // file.mimetype.split('/') = ['image', 'jpeg']
    if (file.mimetype.split('/')[0] === 'image') {
        cb(null, true);
    } else {
        // cb(null, false);
        // or pass in error
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
    }
};



const upload = multer({
    storage, 
    fileFilter, 
    limits: { fileSize: 100000000, files: 2 }
});

app.post("/upload", upload.array('file'), async (req, res) => {
    const file = req.files[0];
    const result = await s3Uploadv2(file);
    res.json({ status: "success", result });
});

// set multer upload errors
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "file is too large",
            });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message: "file limit reached",
            });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "file must be an image",
            });
        }
    }
})

app.listen(4000, () => {
    console.log('listening on port 4000');
})
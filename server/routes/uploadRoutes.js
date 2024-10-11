const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
});

const uploadFunction = upload.single('file');

router.post('/', (req, res) => {
    uploadFunction(req, res, (err) => {
        if (err) {
            res.status(400).send({ message: err.message });
        }
        else if (req.file) {
            console.log(req.file, 'cccc')
            res.status(200).send({
                message: "Image uploaded successfully",
                image: `/${req.file.filename}`
            })
        }
        else {
            res.status(400).send({ message: "No image file provided" });
        }
    })
});

module.exports = router;
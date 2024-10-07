var express = require('express');
var db = require("../dbconnection")
var router = express.Router();
const multer = require("multer");
const path = require('path');
const { unlink } = require('fs');

async function replaceImage(oldImagePath, newImage) {
    const newImagePath = "public/images/portfolio/" + newImage.originalname
    // Create a rollback function to delete the new image if something goes wrong
    const rollback = async () => {
        console.log("rollback tRRriggered");
        await unlink(newImagePath, (err) => {
            if (err) {
                console.error('Error rolling back:', err);
            }
        });
    };

    function deleteLeastImage() {
        return new Promise((resolve, reject) => {
            unlink(oldImagePath, async (err) => {
                console.log("DDeleteLeastImage");

                if (err) {
                    console.log("RRollback");
                    await rollback()
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    try {
        // Delete the old image
        await deleteLeastImage();
    } catch (err) {
        console.error('Error replacing image:', err);
    }
}
const editStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("CCCreateNewImage editStorage");
        cb(null, 'public/images/portfolio/')
    }
});
const editUpload = multer({
    editStorage,
    fileFilter: (req, file, cb) => {
        console.log("CCCreateNewImage");

        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    },
});
router.put("/", editUpload.single('src'), (req, res) => {
    console.log(req.query.accessKey);
    if (req.query.accessKey !== "ey!tash-ne_l") {
        return res.sendStatus(403)
    }
    // console.log({ body: req.body, file: req.file });
    const oldImagePath = "public/images/portfolio/" + req.body.leastImgInp;
    const newImage = req.file;
    console.log({
        oldImagePath, newImage
    });
    replaceImage(oldImagePath, newImage)
        .then(() => {
            console.log("AAlter portfoLLio DB");
            const escapedSrc = req.file.filename
            const escapedDescription = db.escape(req.body.description)
            const escapedSiteName = db.escape(req.body.siteName)
            const escapedHeader = db.escape(req.body.header)
            const query = `update portfolio set 
                src='${escapedSrc}',
                siteName=${escapedSiteName}
                ${req.body.description?.length ? `,description=${escapedDescription}` : ""}
                ${req.body.header?.length ? `,header=${escapedHeader}` : ""}
                where id=${req.body.id}
            `
            db.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400)
                }
                if (results.insertId) {
                    return res.status(200).send({ id: results.insertId, src: escapedSrc })
                } else {
                    return res.sendStatus(500)
                }
            })
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500)
        });
})

router.get('/', function (req, res) {
    const query = `SELECT * FROM portfolio;`

    db.query(query, (err, results,) => {
        if (err) {
            res.sendStatus(400)
            return;
        }
        if (results.length) {
            res.json(results)
        } else {
            res.json([])
        }
    });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("CCCreateNewImage storage");
        cb(null, 'public/images/portfolio/')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get the file extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Unique suffix
        cb(null, uniqueSuffix + ext); // Save with unique name
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    },
});
router.post("/", (req, res) => {
    if (req.query.accessKey !== "ey!tash-ne_l") {
        return res.sendStatus(403)
    }
    try {
        upload.single('src')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.log("ERROR_INSTANCE=" + err);
                return res.sendStatus(400)
            } else if (err) {
                console.log("ERROR=" + err);
                if (err = 'Error: Images only!') {
                    return res.sendStatus(403)
                }
                return res.sendStatus(500)
            }
            const escapedSrc = req.file.filename
            const escapedDescription = db.escape(req.body.description)
            const escapedSiteName = db.escape(req.body.siteName)
            const escapedHeader = db.escape(req.body.header)
            const query = `insert into portfolio(src,siteName${req.body.description?.length ? ",description" : ""}${req.body.header?.length ? ",header" : ""}) values('${escapedSrc}',${escapedSiteName}${req.body.description ? ("," + escapedDescription) : ""}${req.body.header ? ("," + escapedHeader) : ""})`
            db.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400)
                }
                if (results.insertId) {
                    return res.status(200).send({ id: results.insertId, src: escapedSrc })
                } else {
                    return res.sendStatus(500)
                }
            })
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }

})
router.delete("/", ({ query: { id, src, accessKey } }, res) => {
    if (accessKey !== "ey!tash-ne_l") {
        return res.sendStatus(403)
    }
    try {
        db.beginTransaction(function (err) {
            if (err) { console.log(err); return res.sendStatus(500) }
            const query = `delete from portfolio where id=${id}`
            db.query(query, function (err, results) {
                if (err) {
                    db.rollback(function () {
                        console.log(err); return res.sendStatus(500)
                    });
                }
                db.commit(function (err) {
                    if (err) {
                        db.rollback(function () {
                            console.log(err); return res.sendStatus(500)
                        });
                    }
                    if (results.affectedRows > 0) {
                        unlink(`public/images/prtfolio/${src}`, (error) => {
                            if (error) {
                                console.log("EEERRR" + error);
                                db.rollback(function () {
                                    console.log(error); return res.sendStatus(500)
                                });
                            } else {
                                return res.sendStatus(200)
                                // db.end();
                            }

                        })
                    } else {
                        db.rollback(function () {
                            console.log("errRR"); return res.sendStatus(404)
                        })
                    }
                    //

                    //

                });
            });
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500)
    }

})

module.exports = router;
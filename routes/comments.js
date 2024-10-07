var express = require('express');
var db = require("../dbconnection")
var router = express.Router();

router.get('/', function ({ query: { index } }, res) {
    if (!index) {
        return res.sendStatus(400)
    }
    const query = `select * from comments where message_id=${(index / 3) - 23}`
    db.query(query, (err, results,) => {
        if (err) {
            res.status(400).json({
                message: err
            });
            return;
        }
        if (results.length) {
            res.json(results)
        } else {
            res.json([])
        }
    });
});
router.post("/", ({ body: { name, comment, message_id } }, res) => {
    if (!comment || !message_id) {
        return res.sendStatus(400)
    }
    const escapedName = db.escape(name)
    const escapedComment = db.escape(comment)
    const escapedMessage_id = db.escape(message_id)
    const query = `insert into comments(${name?.length ? "name," : ""}comment,message_id) values(${name ? (name === "ey!tash ne#l" ? ("'MAHDI JAHANFAR'" + ",") : (escapedName + ",")) : ""}${escapedComment},${escapedMessage_id})`
    db.query(query, (err, results) => {
        if (err) {
            res.status(400).json({
                message: err
            })
            return;
        }
        if (results.insertId) {
            res.json({ id: results.insertId })
        } else {
            res.json([])
        }
    })
})
router.delete("/", ({ query: { id, accessKey } }, res) => {
    if (accessKey !== "ey!tash-ne_l") {
        return res.sendStatus(403)
    }
    const query = `delete from comments where id=${id}`
    db.query(query, (err, results) => {
        if (err) {
            return res.sendStatus(500)

        }
        if (results.affectedRows > 0) {
            // res.sendStatus(200)
            res.sendStatus(200)
        } else {
            res.sendStatus(404)
        }
    })
})
module.exports = router;
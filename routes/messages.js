var express = require('express');
var db = require("../dbconnection")
var router = express.Router();

router.get('/', function (req, res) {
    const query = `SELECT * FROM messages WHERE email IS NULL;`

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
router.post("/", ({ body: { name, subject, message, email } }, res) => {
    const escapedName = db.escape(name)
    const escapedSubject = db.escape(subject)
    const escapedMessage = db.escape(message)
    const escapedEmail = db.escape(email)
    const query = `insert into messages(${name?.length ? "name," : ""}${subject?.length ? "subject," : ""}message${email?.length ? ",email" : ""}) values(${name ? (name === "ey!tash ne#l" ? ("'MAHDI JAHANFAR'" + ",") : (escapedName + ",")) : ""}${subject ? (escapedSubject + ",") : ""}${escapedMessage}${email ? ("," + escapedEmail) : ""}) `
    db.query(query, (err, results) => {
        if (err) {
            res.sendStatus(400)
            return;
        }
        if (results.insertId) {
            res.json({ id: results.insertId, status: 200 })
        } else {
            res.json([])
        }
    })
})
router.delete("/", ({ query: { id, accessKey } }, res) => {
    if (accessKey !== "ey!tash-ne_l") {
        return res.sendStatus(403)
    }
    // the first query
    const query = `delete from comments where message_id=${id}`
    db.query(query, (err, results) => {
        if (err) {
            res.sendStatus(500)
            return;
        } else {
            // the second query
            const query = `delete from messages where id=${id}`
            db.query(query, (err, results) => {
                if (err) {
                    res.sendStatus(500)
                    return;
                }
                if (results.affectedRows > 0) {
                    res.sendStatus(200)
                } else {
                    res.sendStatus(404)
                }
            })
        }
    })
})
module.exports = router;
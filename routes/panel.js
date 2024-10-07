var express = require('express');
var db = require("../dbconnection")
var router = express.Router();

router.get('/', function ({ query: { id } }, res) {
    const query = `SELECT * FROM panel where password='${id.replace("-", " ").replace("_", "#")}'`
    db.query(query, (err, results,) => {
        if (err) {
            res.sendStatus(400)
            return;
        }
        if (results.length) {
            // second layer
            const query = `SELECT * FROM messages`
            db.query(query, (err, results,) => {
                if (err) {
                    res.sendStatus(400)
                    return;
                }
                if (results.length) {
                    res.json(results)
                } else {
                    res.sendStatus(404)
                }
            });
            //
        } else {
            res.sendStatus(404)
        }
    });
});
router.post("/", ({ body: { name, password, email } }, res) => {
    const escapedName = db.escape(name)
    const escapedPassword = db.escape(password)
    const escapedEmail = db.escape(email)
    const query = `update panel set enters=enters+1 where password=${escapedPassword} and name=${escapedName} and email=${escapedEmail}`
    db.query(query, (err, results) => {
        if (err) {
            return res.sendStatus(400)
        }
        if (results.changedRows !== undefined) {
            if (results.changedRows > 0) {
                // second layer
                const query = `SELECT enters FROM panel`
                db.query(query, (err, results) => {
                    if (err) {
                        res.sendStatus(400)
                        return;
                    }
                    if (results.length) {
                        res.json(results[0])
                    } else {
                        // res.sendStatus(404)
                    }
                });
                //
            } else {
                res.json("")
            }
        } else {
            res.sendStatus(500)
        }

    })
})
module.exports = router;
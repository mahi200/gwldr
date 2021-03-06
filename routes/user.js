var debug = require('debug')('VaccineForChild:user');
var express = require('express');
var session = require('../utility/session');
var database = require('../utility/database');
var other = require('../utility/scheduled-task');

var router = express.Router();

/* GET list of all children */
router.get('/get-children', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        // get children from database
        database.getChildrenOf(data.id, function (err, result) {
            if (err) { // error in database
                res.status(500).send(err);
            }
            else { // got children from database
                res.status(200).send(result);
            }
        });
    } else {
        res.status(401).end();
    }
});

/* POST change password */
router.post('/update-user', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var user = req.body;
        // set id
        user.id = data.id;
        // check if email has changed
        if (user.email != data.email)
            user.confirmed = 0;
        // request database to update user
        database.updateUser(user, function (err, result) {
            if (err) { // error in database
                debug(err);
                res.status(200).send(err);
            }
            else { // data received successfully
                // send confirm code if not confirmed
                if (!result.confirmed) {
                    session.sendConfirmMail(data);
                }
                // update session
                debug(result);
                Object.keys(result).forEach(function (key) {
                    data[key] = result[key];
                });
                // send success message
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});

/* POST add new child */
router.post('/add-child', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var user = req.body;
        // calculate date of birth
        if (user.year && user.month && user.day) {
            user.dob = (new Date(user.year, user.month, user.day)).getTime();
        }
        // create child in the database
        database.createChildWithParent(data.id, user.name, user.dob, user.gender,user.parent_name,user.parent_phone,user.parent_email,
            function (err, result) {
                if (err) { // database returned error
                    debug(err);
                    res.status(200).send(err);
                }
                else {
                    // send success message
                    res.status(200).end();
                }
            });
    } else {
        res.status(401).end();
    }
});

router.post('/update-child', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.body;
        // calculate date of birth
        if (child.year && child.month && child.day) {
            child.dob = (new Date(child.year, child.month, child.day)).getTime();
        }
        // update child in database
        database.updateChild(child, function (err, result) {
            if (err) { // database returned error
                res.status(200).send(err);
            } else {
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});

router.post('/delete-child', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.body;
        console.log("userjs----child.id:"+child.id);
    	
        // delete child from database
        database.deleteChild(child.id, function (err, result) {
            if (err) { // database returned error
                res.status(200).send(err);
            } else {
                // send success message
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});

router.post('/set-phone', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        data.temp_phone = req.body.phone;
        session.sendConfirmSMS(data, function (err, result) {
            res.status(200).send(err);
        });
    } else {
        res.status(401).end();
    }
});

router.post('/add-phone', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var user = req.body;
        if (data.phone_code == user.code && data.temp_phone == user.phone) {
            var update = {id: data.id, phone: user.phone};
            database.updateUser(update, function (err, result) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    data.phone = user.phone;
                    res.status(200).end();
                    delete data.temp_phone;
                    delete data.phone_code;
                }
            });
        } else {
            res.status(500).send('Verification failed. Code did not match or invalid number.')
        }
    } else {
        res.status(401).end();
    }
});


router.post('/remove-phone', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var update = {id: data.id, phone: ""};
        database.updateUser(update, function (err, result) {
            res.status(200).end(err);
            if (!err) data.phone = "";
        });
    }
    else {
        res.status(401).end();
    }
});


/* GET list of all children */
router.post('/set-taken', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var taken = req.body;
        // get children from database
        database.setTaken(taken, function (err, result) {
            if (err) { // error in database
                res.status(500).send(err);
            }
            else { // got children from database
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});

/* GET list of all children */
router.get('/get-taken', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        // get children from database
        database.getTakens(data.id, function (err, result) {
            if (err) { // error in database
                res.status(500).send(err);
            }
            else { // got children from database
                res.status(200).send(result);
            }
        });
    } else {
        res.status(401).end();
    }
});

/* GET number of doses taken by a child */
router.get('/child-dose', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.query;
        // get children from database
        database.childTaken(child.id, function (err, result) {
            if (err) { // error in database
                res.status(500).send(err);
            }
            else { // got children from database
                res.status(200).send(result.length.toString() || "0");
            }
        });
    } else {
        res.status(401).end();
    }
});

/* POST add height to a child */
router.post('/add-height', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.body;
        // get children from database
        child.date = (new Date(child.date)).getTime();
        database.setHeight(child.id, child.date, child.value, function (err, result) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});


/* POST add weight to a child */
router.post('/add-weight', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.body;
        // get children from database
        child.date = (new Date(child.date)).getTime();
        database.setWeight(child.id, child.date, child.value, function (err, result) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});

/* POST delete height to a child */
router.post('/delete-height', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.body;
        // get children from database
        database.deleteHeight(child.id, child.age, child.value, function (err, result) {
            if (err) {
                res.status(200).send(err);
            }
            else {
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});

/* POST delete weight to a child */
router.post('/delete-weight', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.body;
        // get children from database
        database.deleteHeight(child.id, child.age, child.value, function (err, result) {
            if (err) {
                res.status(200).send(err);
            }
            else {
                res.status(200).end();
            }
        });
    } else {
        res.status(401).end();
    }
});

/* Get latest height to a child */
router.get('/last-height', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.query;
        // get children from database
        database.getLatestHeight(child.id, function (err, result) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result[0]);
            }
        });
    } else {
        res.status(401).end();
    }
});

/* Get latest weight to a child */
router.get('/last-weight', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.query;
        // get children from database
        database.getLatestWeight(child.id, function (err, result) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result[0]);
            }
        });
    } else {
        res.status(401).end();
    }
});

/* Get all heights of a child */
router.get('/get-heights', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.query;
        // get children from database
        database.getAllHeight(child.id, function (err, result) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    } else {
        res.status(401).end();
    }
});

/* Get all weights of a child */
router.get('/get-weights', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        var child = req.query;
        // get children from database
        database.getAllWeight(child.id, function (err, result) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    } else {
        res.status(401).end();
    }
});


/* GET all schedules of an user */
router.get('/schedules', function (req, res, next) {
    var data = session.getDataByRequest(req);
    if (data) {
        database.getSchedulesOf(data.id, function (err, result) {
            if (err) res.status(500).end(err);
            else res.status(200).send(result);
        })
    } else {
        res.status(401).end();
    }
});


module.exports = router;
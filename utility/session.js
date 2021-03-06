var debug = require('debug')('VaccineForChild:session');
var mailer = require('../utility/mailer');
var messeger = require('../utility/messeger');
var crypto = require('crypto');

var KEY_LENGTH = 16;
var SESSION_ID_COOKIE = 'SessionID';

var allSession = {};

var getKey = function () {
    var key = null;
    while (!key || allSession.hasOwnProperty(key))
        key = crypto.randomBytes(KEY_LENGTH).toString('hex');
    return key;
};

var addSession = function (data) {
    data.key = getKey();
    data.creationTime = (new Date()).getTime();
    data.lastAccessTime = (new Date()).getTime();
    allSession[data.key] = data;

    debug("Created: " + data.key);
    return data;
};

var getSession = function (key) {
    if (allSession.hasOwnProperty(key)) {
        var session = allSession[key];
        session.lastAccessTime = (new Date()).getTime();
        return session;
    }
    return null;
};

var removeSession = function (key) {
    if (allSession.hasOwnProperty(key)) {
        delete allSession[key];
    }
};

var getDataByRequest = function (request) {
    var key = request.cookies[SESSION_ID_COOKIE];
    return getSession(key);
};


var getConfirmCode = function () {
    // generate confirm code : 5 digits
    return Math.floor((Math.random() * 899999) + 100000);
};

var sendConfirmMail = function (data, callback) {
    data.code = getConfirmCode();
    mailer.sendConfirmCode(data.email, data.code, function (err, info) {
        if (err) debug(err);
        else if (info) debug(info);
        if(callback) callback(err ? "Could not send email" : null);
    });
};

var sendConfirmSMS = function(data, callback) {
    data.phone_code = getConfirmCode();
    var sms = "Use " + data.phone_code + " as your verification code for VaccineForChild.";
    messeger.sendSms(data.temp_phone,sms, function (err, message) {
        if(err){
            debug(err);
            console.log(err);
            ////callback('Could not send SMS.');
             callback(err);
        } else{
            callback(null);
        }
    } )

};

module.exports.SESSION_ID_COOKIE = SESSION_ID_COOKIE;
module.exports.getDataByRequest = getDataByRequest;
module.exports.addSession = addSession;
module.exports.getSession = getSession;
module.exports.removeSession = removeSession;
module.exports.getConfirmCode = getConfirmCode;
module.exports.sendConfirmMail = sendConfirmMail;
module.exports.sendConfirmSMS = sendConfirmSMS;


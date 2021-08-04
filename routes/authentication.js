var express = require('express');
var Router = express.Router();
var authController = require('../controllers/auth_controller');

var router = function () {

    Router.post('/register', authController.register);
    Router.post('/login', authController.login);
    Router.post('/verify', authController.verify);
    Router.post('/sendemail', authController.sendEmail);

    return Router
}

module.exports = router();
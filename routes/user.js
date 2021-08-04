var express = require('express');
var Router = express.Router();
var userController = require('../controllers/user_controller');

var router = function(){

    Router.get('/getusers', userController.getUsers);

    return Router
}

module.exports = router();
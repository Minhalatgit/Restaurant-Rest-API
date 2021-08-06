var express = require('express');
var Router = express.Router();
var scheduleController = require('../controllers/schedule_controller');

var router = function(){

    Router.post('/createSchedule', scheduleController.createSchedule);

    return Router
}

module.exports = router();
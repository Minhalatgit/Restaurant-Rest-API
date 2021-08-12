var express = require('express');
var Router = express.Router();
var ordersController = require('../controllers/orders_controller');

var router = function(){

    Router.post('/createOrder', ordersController.createOrder);

    return Router
}

module.exports = router();
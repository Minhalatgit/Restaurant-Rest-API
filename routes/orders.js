var express = require('express');
var Router = express.Router();
var ordersController = require('../controllers/orders_controller');

var router = function(){

    //Customer
    Router.post('/create', ordersController.createOrder);
    
    //Admin
    Router.get('/approve', ordersController.approveOrder);
    Router.get('/reject', ordersController.rejectOrder);

    //Rider
    Router.get('/reject', ordersController.acceptOrder);
    Router.get('/reject', ordersController.declineOrder);

    //  --
    Router.get('/getorder', ordersController.getOrder);
    Router.get('/getorders', ordersController.getOrders);
    Router.get('/getclientorders', ordersController.getClientOrders);

    return Router
}

module.exports = router();
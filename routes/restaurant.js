var express = require('express');
var Router = express.Router();
var restaurantController = require('../controllers/restaurant_controller');
var upload = require('../helper/image_upload');

var router = function(){

    //Admin
    Router.get('/getadminrestaurants', restaurantController.getAdminRestaurants);
    Router.get('/getadminrestaurant', restaurantController.getAdminRestaurant);
    Router.post('/createrestaurant', upload.upload.single('restaurant_image'), restaurantController.createRestaurant);
    Router.post('/updaterestaurant', upload.upload.single('restaurant_image'), restaurantController.updateRestaurant);
    Router.delete('/deleterestaurant', restaurantController.deleteRestaurant);

    //Client
    Router.get('/getuserrestaurants', restaurantController.getUserRestaurants);

    return Router
}

module.exports = router();
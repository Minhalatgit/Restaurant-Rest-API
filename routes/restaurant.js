var express = require('express');
var Router = express.Router();
var restaurantController = require('../controllers/restaurant_controller');
var upload = require('../helper/image_upload');

var router = function(){

    //Admin
    Router.get('/getadminrestaurants', restaurantController.getAdminRestaurants);
    Router.get('/getadminrestaurant', restaurantController.getAdminRestaurant);
    Router.post('/createadminrestaurant', upload.upload.single('restaurant_image'), restaurantController.createAdminRestaurant);
    Router.post('/updateadminrestaurant', upload.upload.single('restaurant_image'), restaurantController.updateAdminRestaurant);
    Router.delete('/deleteadminrestaurant', restaurantController.deleteAdminRestaurant);

    //Client
    Router.get('/getuserrestaurants', restaurantController.getUserRestaurants);

    return Router
}

module.exports = router();
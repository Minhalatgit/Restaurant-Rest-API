var express = require('express');
var Router = express.Router();
var searchController = require('../controllers/search_controller');

var router = function(){

    Router.get('/item', searchController.searchItem);
    Router.get('/restaurant', searchController.searchRestaurant);

    return Router
}

module.exports = router();
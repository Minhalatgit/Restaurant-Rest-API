var express = require('express');
var Router = express.Router();
var categoryController = require('../controllers/category_controller');

var router = function(){

    Router.post('/createcategory', categoryController.createCategory);
    Router.get('/getcategories', categoryController.getCategories);
    Router.delete('/deletecategory', categoryController.deleteCategory);

    return Router
}

module.exports = router();
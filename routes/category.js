var express = require('express');
var Router = express.Router();
var categoryController = require('../controllers/category_controller');
var upload = require('../helper/image_upload');

var router = function(){

    Router.post('/createcategory', upload.upload.single('category_image'), categoryController.createCategory);
    Router.get('/getcategories', categoryController.getCategories);
    Router.delete('/deletecategory', categoryController.deleteCategory);

    return Router
}

module.exports = router();
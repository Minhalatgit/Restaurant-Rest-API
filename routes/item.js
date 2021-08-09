var express = require('express');
var Router = express.Router();
var itemController = require('../controllers/item_controller');
var upload = require('../helper/image_upload');

var router = function(){

    //Admin
    Router.post('/createitem', upload.upload.single('item_image'), itemController.createItem);
    Router.post('/updateitem', upload.upload.single('item_image'), itemController.updateItem);
    Router.delete('/deleteitem', itemController.deleteItem);
    Router.get('/getitem', itemController.getItem);
    Router.get('/getitems', itemController.getItems);

    //Client
    Router.get('/getclientitems', itemController.getClientItems);

    return Router
}

module.exports = router();
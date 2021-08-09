const express = require('express');
const app =  express();

var userRoute = require('./user');
var restaurantRoute = require('./restaurant');
var itemRoute = require('./item');
var categoryRoute = require('./category');

app.use('/user', userRoute);
app.use('/restaurant', restaurantRoute);
app.use('/item', itemRoute);
app.use('/category', categoryRoute);

module.exports = app;
const express = require('express');
const app =  express();
const sql = require('../connection');

var userRoute = require('./user');
var restaurantRoute = require('./restaurant');
var itemRoute = require('./item');
var categoryRoute = require('./category');
var reviewRoute = require('./review');
var ordersRoute = require('./orders');
var searchRoute = require('./search');

app.use('/user', userRoute);
app.use('/restaurant', restaurantRoute);
app.use('/item', itemRoute);
app.use('/category', categoryRoute);
app.use('/review', reviewRoute);
app.use('/orders', ordersRoute);
app.use('/search', searchRoute);

module.exports = app;
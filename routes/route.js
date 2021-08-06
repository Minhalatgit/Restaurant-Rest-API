const express = require('express');
const app =  express();

var userRoute = require('./user');
var restaurantRoute = require('./restaurant');
var scheduleRoute = require('./schedule');

app.use('/user', userRoute);
app.use('/restaurant', restaurantRoute);
app.use('/schedule', scheduleRoute);

module.exports = app;
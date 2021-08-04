const express = require('express');
const app =  express();

var userRoute = require('./user');

app.use('/user', userRoute);

module.exports = app;
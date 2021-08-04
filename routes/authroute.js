const express = require('express');
const app =  express();

var authRoute = require('./authentication');

app.use('/', authRoute);

module.exports = app;
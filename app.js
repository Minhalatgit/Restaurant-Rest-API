const express = require('express');

const route = require('./routes/route');
const authroute = require('./routes/authentication');
var authorization = require('./helper/authorization');

const app = express();
var cors = require('cors')

app.use(cors());
app.options('*', cors())
app.use( '/uploads', express.static('uploads'));
app.use(express.urlencoded({extended: true})); 
app.use(express.json());

//route for authentication apis
app.use('/auth', authroute);

//route for authentication apis
// app.use('/api', authorization.checkToken, route); token not checking during dev
app.use('/api', route);

const PORT = 5000;
app.listen(PORT, () => console.log(`Listening to port ${PORT}...`));
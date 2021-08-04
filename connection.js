const mysql = require('mysql');

const connection = mysql.createConnection({
    host            :   'localhost',
    user            :   'root',
    password        :   '',
    database        :   'restaurant_app_db'
});

connection.connect((err) =>{
    if(err) console.log(`Database connection failed ${err}`);
    else console.log('Database connection successful');
});

module.exports = connection;
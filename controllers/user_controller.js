'user strict';
const sql = require('../connection');

exports.getUsers = async (req, res) =>{

    try {
        const body = req.body;
        sql.query('SELECT * FROM user', (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Users fetched successfully',
                    data: result
                })
            } else{
                return res.send(err);
            }
        })

    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong',
            data: []
        }) 
    }

}

exports.getUser = async (req, res) =>{

    try {
        const id = req.query.user_id;
        sql.query('SELECT * FROM user WHERE user_id = ? ', id, (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'User fetched successfully',
                    data: result[0]
                })
            } else{
                return res.send(err);
            }
        })

    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong',
            data: []
        }) 
    }

}
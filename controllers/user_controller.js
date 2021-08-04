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
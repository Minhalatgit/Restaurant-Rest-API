'user strict';
const sql = require('../connection');

exports.createSchedule = async (req, res) =>{

    try {
        const { schedule_time } = req.body;

        console.log(schedule_time);
        sql.query('INSERT INTO schedule(schedule_time) VALUES(?)', [ schedule_time ], (err, result) =>{
            if (err) return res.send(err);
            
            return res.json({
                status: true,
                msg: 'Schedule created successfully'
            })
        })

    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        }) 
    }

}

exports.updateAdminRestaurant = async (req, res) =>{

    try {
        const {restaurant_name, restaurant_longitude, restaurant_latitude, restaurant_phone, restaurant_email, restaurant_status, restaurant_id} = req.body;
        const file = req.file;

        const validRestaurant = checkValidRestaurant(req.body);

        if(!validRestaurant.isValid){
            return res.json({
                status: validRestaurant.isValid,
                msg: validRestaurant.errorMessage
            })
        }

        let query = `UPDATE restaurant SET restaurant_name = ?, restaurant_longitude = ?, restaurant_longitude = ?, 
                    restaurant_phone = ?, restaurant_email = ?, restaurant_status = ? WHERE restaurant_id = ?`
        let queryValues = [restaurant_name, restaurant_longitude, restaurant_latitude, restaurant_phone, restaurant_email, restaurant_status, restaurant_id] 

        if(file){
            query = `UPDATE restaurant SET restaurant_name = ?, restaurant_longitude = ?, restaurant_longitude = ?,
                    restaurant_phone = ?, restaurant_email = ?, restaurant_status = ? WHERE restaurant_id = ?`
            queryValues = [restaurant_name, restaurant_longitude, restaurant_latitude, restaurant_phone, restaurant_email, restaurant_status, file.path, restaurant_id] 
        }

        sql.query(query, queryValues, (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Restaurant updated successfully'
                })
            } else{
                return res.send(err);
            }
        })

    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        }) 
    }

}

exports.deleteAdminRestaurant = async (req, res) =>{

    try {
        const id = req.query.restaurant_id;
        sql.query('DELETE FROM restaurant WHERE restaurant_id = ?',[ id ], (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Restaurant deleted successfully'
                })
            } else{
                return res.send(err);
            }
        })

    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        }) 
    }

}

exports.getAdminRestaurant = async (req, res) =>{

    try {
        const id = req.query.restaurant_id;
        console.log(req.query)
        sql.query('SELECT * FROM restaurant WHERE restaurant_id = ?', [ id ], (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Restaurant fetched successfully',
                    data: result[0] //zero for single record
                })
            } else{
                return res.send(err);
            }
        })

    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        }) 
    }

}

exports.getAdminRestaurants = async (req, res) =>{

    try {
        sql.query('SELECT * FROM restaurant', (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Restaurants fetched successfully',
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
            msg: 'Something went wrong'
        }) 
    }

}

'user strict';
const sql = require('../connection');
var forEachAsync = require('async-foreach').forEach;

function checkValidRestaurant(restaurant) {
    let errorMessage = ""
    let isValid = false

    if(restaurant.restaurant_name == ""){
        errorMessage = "Restaurant name is required"
        isValid = false
    } else if(restaurant.restaurant_longitude == ""){
        errorMessage = "Restaurant longitude is required"
        isValid = false
    } else if(restaurant.restaurant_latitude == ""){
        errorMessage = "Restaurant latitude is required"
        isValid = false
    } else if(restaurant.restaurant_phone == ""){
        errorMessage = "Restaurant phone is required"
        isValid = false
    } else if(restaurant.restaurant_email == ""){
        errorMessage = "Restaurant email is required"
        isValid = false
    } else{
        errorMessage = "Valid data"
        isValid = true
    }
    return {isValid, errorMessage}
}

exports.createRestaurant = async (req, res) =>{

    try {
        let {restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time, restaurant_close_time, restaurant_phone, restaurant_email, categories} = req.body;
        const file = req.file;
        categories = JSON.parse(categories)

        const validRestaurant = checkValidRestaurant(req.body);

        if(!validRestaurant.isValid){
            return res.json({
                status: validRestaurant.isValid,
                msg: validRestaurant.errorMessage
            })
        }

        let query = `INSERT INTO restaurant(restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time,
             restaurant_close_time, restaurant_phone, restaurant_email, restaurant_status ) VALUES(?,?,?,?,?,?,?,?,?,?)`
        let queryValues = [restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time, restaurant_close_time, restaurant_phone, restaurant_email, 1] 

        if(file){
            query = `INSERT INTO restaurant(restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time, 
                    restaurant_close_time, restaurant_phone, restaurant_email, restaurant_status, restaurant_image ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`
            queryValues = [restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time, restaurant_close_time, restaurant_phone, restaurant_email, 1, file.path] 
        }

        sql.query(query, queryValues, (err, result) =>{
            if (err) return res.send(err);
            
            forEachAsync(categories, function(item, index, arr) {
                sql.query('INSERT INTO restaurant_category(restaurant_id, category_id) VALUES(?,?)', [result.insertId, item], (errCat, resultCat)=>{
                    if(errCat) return res.send(errCat);
                    console.log('Insert in loop for category_id:', item);
                })
            });

            console.log('Outside loop');
              
            return res.json({
                status: true,
                msg: 'Restaurant created successfully'
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

exports.updateRestaurant = async (req, res) =>{

    try {
        const {restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time, restaurant_close_time, restaurant_phone, restaurant_email, restaurant_status, restaurant_id, schedule_id} = req.body;
        const file = req.file;
        const categories = JSON.parse(req.body.categories);

        console.log(restaurant_name, restaurant_longitude, restaurant_latitude, restaurant_open_time, restaurant_close_time, restaurant_phone, restaurant_email, restaurant_status, restaurant_id)

        const validRestaurant = checkValidRestaurant(req.body);

        if(!validRestaurant.isValid){
            return res.json({
                status: validRestaurant.isValid,
                msg: validRestaurant.errorMessage
            })
        }

        let query = `UPDATE restaurant SET restaurant_name = ?, restaurant_subtitle = ?, restaurant_address = ?, restaurant_longitude = ?, restaurant_latitude = ?, restaurant_open_time = ?,
            restaurant_close_time = ?, restaurant_phone = ?, restaurant_email = ?, restaurant_status = ? WHERE restaurant_id = ?`
        let queryValues = [restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time, restaurant_close_time, restaurant_phone, restaurant_email, restaurant_status, restaurant_id] 

        if(file){
            query = `UPDATE restaurant SET restaurant_name = ?, restaurant_subtitle = ?, restaurant_address = ?, restaurant_longitude = ?, restaurant_latitude = ?, restaurant_open_time = ?, restaurant_close_time = ?,
                    restaurant_phone = ?, restaurant_email = ?, restaurant_status = ?, restaurant_image = ? WHERE restaurant_id = ?`
            queryValues = [restaurant_name, restaurant_subtitle, restaurant_address, restaurant_longitude, restaurant_latitude, restaurant_open_time, restaurant_close_time, restaurant_phone, restaurant_email, restaurant_status, file.path, restaurant_id] 
        }

        console.log(query)

        sql.query(query, queryValues, (err, result) =>{
            if (err) return res.send(err);
            
            console.log(result);

            sql.query('DELETE FROM restaurant_category WHERE restaurant_id = ?', [restaurant_id], (errDel, resultDel) =>{
                if(errDel) return res.send(errDel);
                console.log('Delete restaurant_id:', restaurant_id);
            })

            forEachAsync(categories, function(item, index, arr) {
                sql.query('INSERT INTO restaurant_category(restaurant_category_id, restaurant_id, category_id) VALUES(?,?,?) ON DUPLICATE KEY UPDATE category_id = ?, restaurant_id = ?', [null, restaurant_id, item, item, restaurant_id], (errCat, resultCat)=>{
                    if(errCat) return res.send(errCat);
                    console.log('Insert in loop for category_id:', item);
                })
            });

            console.log('Outside loop');

            return res.json({
                status: true,
                msg: 'Restaurant updated successfully'
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

exports.deleteRestaurant = async (req, res) =>{

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
        sql.query(`SELECT res.*, count(rev.review_id) as totat_reviews, rating FROM restaurant as res 
                   LEFT JOIN review as rev 
                   ON rev.restaurant_id = res.restaurant_id 
                   GROUP BY res.restaurant_id`,
                    (err, result) =>{
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

exports.getUserRestaurants = async (req, res) =>{

    try {
        const { restaurant_latitude, restaurant_longitude, kilometers } = req.query;
        let query = `SELECT restaurant.*, count(rev.review_id) as totat_reviews, rating 
                    FROM (SELECT *,(((acos(sin(( ${restaurant_latitude} * pi() / 180))
                    * sin(( restaurant.restaurant_latitude * pi() / 180)) + cos(( ${restaurant_latitude} * pi() /180 )) 
                    *cos(( restaurant.restaurant_latitude * pi() / 180)) * cos(((${restaurant_longitude} - restaurant.restaurant_longitude)
                    * pi()/180)))) * 180/pi() ) * 60 * 1.1515 * 1.609344 )as distance FROM restaurant) restaurant
                    LEFT JOIN review as rev ON rev.restaurant_id = restaurant.restaurant_id 
                    WHERE distance <= ${kilometers} AND restaurant.restaurant_status = 1 GROUP BY restaurant.restaurant_id`
        sql.query(query, (err, result)=>{
                if(err) return res.send(err);  

                let restaurantIds = result.map((restaurant) =>{
                    return restaurant.restaurant_id
                })
                restaurantIds = restaurantIds.toString()
                console.log('Restaurant ids ', restaurantIds);

                sql.query(`SELECT category.* FROM category 
                INNER JOIN restaurant_category on restaurant_category.category_id= category.category_id
                WHERE restaurant_category.restaurant_id in (${restaurantIds})
                GROUP BY category.category_id `, (errCat, resultCat)=>{
                    if(errCat) return res.send(errCat);  
                    
                    return res.json({
                        status: true,
                        msg : "Data fetched successfully",
                        data: {
                            restaurants: result,
                            categories: resultCat
                        }
                    });
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

exports.getUserRestaurant = async (req, res) =>{

    try {
        const { restaurant_id } = req.query;
        sql.query("SELECT * FROM category INNER JOIN restaurant_category on restaurant_category.category_id= category.category_id WHERE restaurant_category.restaurant_id = ?", [restaurant_id] ,(err, result)=>{
                if(!err){
                    console.log(result)
                    return res.json({
                        status: true,
                        msg : "Data fetched successfully",
                        data : result
                    });
                } else {
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

exports.getRestaurantCategories = async (req, res) =>{

    try {
        const { restaurant_id } = req.query;
        sql.query(`SELECT * FROM category 
                   INNER JOIN restaurant_category
                   ON restaurant_category.category_id = category.category_id
                   WHERE restaurant_category.restaurant_id = ?`, [restaurant_id] ,(err, result)=>{
                if(!err){
                    console.log(result)
                    return res.json({
                        status: true,
                        msg : "Data fetched successfully",
                        data : result
                    });
                } else {
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
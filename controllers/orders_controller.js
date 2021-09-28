'user strict';
const sql = require('../connection');

var FCM = require('fcm-node');
var serverKey = 'AAAAePGgVsQ:APA91bFGrQmlE-ZnYudHLx6d2dUT03qi05XSKGLTzKM6H3LifWCF3Hzk77u18zURD54-HeLap2_b4AHnGkJqay59xL2SVmD-bRNMDalxCS29WynvbKFCjbphjL-N2sJwY77hUprXAo4F';
var fcm = new FCM(serverKey);

function sendNotification(body, userId){

    var message = {
            
        to: `/topics/${userId}`,
        //to: `/topics/RestaurantApp`, //for testing
        //collapse_key: 'your_collapse_key',
        
        notification: {
            title: 'Restaurant app', 
            body: body 
        }
        
        // data: {  //you can send only notification or only data(or include both)
        //     my_key: 'my value',
        //     my_another_key: 'my another value'
        // }
    };

    const promise = new Promise((resolve, reject)=>{

        fcm.send(message, (err, response) =>{
            if (err) {
                reject(err)
            } else {
               resolve(response)
            }
        });
    })

    return promise;
}

// Customer creating order
exports.createOrder = async (req, res) =>{

    try {
        const { user_id, restaurant_id, order_remarks, order_payment_method, order_price, order_location, items } = req.body;

        /* Creating order record in order table, order item and also updating order_status to 2 for 
        pending status until it is assigned to any rider */  

        sql.beginTransaction((transactionError)=>{
            if(transactionError) return res.send(transactionError);

                sql.query(`INSERT INTO orders(user_id, restaurant_id, order_remarks, order_payment_method, order_price, order_location, order_status) 
            VALUES(?,?,?,?,?,?,?)`, [user_id, restaurant_id, order_remarks, order_payment_method, order_price, order_location, 2], (err, result) =>{
                    
                if (err){
                    sql.rollback(()=> {
                        return res.json({
                            status: false,
                            msg: err,
                        })
                    });
                }

                sql.query(`INSERT INTO order_item(order_id, items) VALUES(?,?)`, [result.insertId, JSON.stringify(items)], (itemErr, itemResult) =>{
                    if (itemErr){
                        sql.rollback(()=> {
                            return res.json({
                                status: false,
                                msg: itemErr,
                            })
                        });
                    }
                    //Todo: To send notification to riders

                    sendNotification('Your order has been created', user_id).then((response)=>{
                        console.log('Notification sent');

                        sql.commit((commitErr) =>{
                            if(commitErr){
                            sql.rollback(()=> {
                                return res.json({
                                    status: false,
                                    msg: "Order creation failed, try again",
                                })
                            });
                            } else{
                                return res.json({
                                    status: true,
                                    msg: 'Order created successfully'
                                })
                            }
                        });

                    }).catch((e) =>{
                        console.log('Notification not sent ', e);
                        sql.rollback(()=> {
                            return res.json({
                                status: false,
                                msg: 'Something went wrong',
                            })
                        });
                    })
                })
            });
        });
    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        }) 
    }

}

// Admin approving order
exports.approveOrder = async (req, res) =>{

    try {
        const {order_id, user_id} = req.query;
        
        /* Approving order and updating order status to 6 which referes to approved order status */ 
     
        sql.query('UPDATE orders SET order_status = ? WHERE order_id = ?',[ 6, order_id ], (err, result) =>{
            if (err) return res.send(err);

            sendNotification('Your order has been approved by admin', user_id)
            .then((response)=>{
                console.log('Notification sent');
                return res.json({
                    status: true,
                    msg: 'Order approved successfully'
                });
            }).catch((e)=>{
                console.log('Notification not sent ', e);
                return res.json({
                    status: false,
                    msg: 'Something went wrong'
                })
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

// Admin rejecting order
exports.rejectOrder = async (req, res) =>{

    try {

        const {order_id, user_id} = req.query;

        /* Rejecting order and updating order status to 5 which referes to reject status */ 

        sql.beginTransaction((transactionError) =>{
            if(transactionError) return res.send(transactionError);

            sql.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [ 5, order_id ], (err, result) =>{
                if (err){
                    sql.rollback(() =>{
                        return res.send(err);
                    });
                }
    
                sendNotification('Your order has been rejected by admin', user_id)
                .then((response)=>{
                    console.log('Notification sent');

                    sql.commit((commitErr) =>{
                        if(commitErr){
                            sql.rollback(()=> {
                                return res.json({
                                    status: false,
                                    msg: "Order cancellation failed, try again",
                                });
                            });
                        } else{
                            return res.json({
                                status: true,
                                msg: 'Order rejected successfully'
                            });
                        }
                    });

                }).catch((e)=>{
                    console.log('Notification not sent ', e);

                    sql.rollback(()=>{
                        return res.json({
                            status: false,
                            msg: 'Something went wrong'
                        });
                    })
                })
            })

        })

    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        });
    }

}

// Rider accepting order
exports.acceptOrder = async (req, res) =>{

    try {
        const {order_id, user_id} = req.query;
        
        /* Accepting order and updating order status to 4 which referes to accpeted order status */ 
     
        sql.query('UPDATE orders SET order_status = ? WHERE order_id = ?',[ 4, order_id ], (err, result) =>{
            if (err) return res.send(err);

            sendNotification('Your order has been accepted by rider', user_id)
            .then((response)=>{
                console.log('Notification sent');
                return res.json({
                    status: true,
                    msg: 'Order accepted successfully'
                })
            }).catch((e)=>{
                console.log('Notification not sent ', e);
                return res.json({
                    status: false,
                    msg: 'Something went wrong'
                })
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

// Rider declining order
exports.declineOrder = async (req, res) =>{

    try {
        const {order_id, user_id} = req.query;
        
        /* Delining  order and updating order status to 3 which referes to declined order status */ 
     
        sql.query('UPDATE orders SET order_status = ? WHERE order_id = ?',[ 3, order_id ], (err, result) =>{
            if (err) return res.send(err);

            sendNotification('Your order has been declined by rider', user_id)
            .then((response)=>{
                console.log('Notification sent');
                return res.json({
                    status: true,
                    msg: 'Order declined successfully'
                })
            }).catch((e)=>{
                console.log('Notification not sent ', e);
                return res.json({
                    status: false,
                    msg: 'Something went wrong'
                })
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

exports.getOrder = async (req, res) =>{

    try {
        const id = req.query.order_id;
        console.log(req.query)
        sql.query('SELECT * FROM orders WHERE order_id = ?', [ id ], (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Order fetched successfully',
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

exports.getOrders = async (req, res) =>{

    try {
        sql.query('SELECT o.*, oi.*  FROM orders as o INNER JOIN order_item as oi ON o.order_id = oi.order_id', (err, result) =>{
            if (err) return res.send(err); 

            const data = result.map( item =>{
                return {...item, items:JSON.parse(item.items)}
            })

            return res.json({
                status: true,
                msg: 'Orders fetched successfully',
                data: data
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

exports.getClientOrders = async (req, res) =>{

    try {
        const user_id = req.query.user_id;

        sql.query('SELECT o.*, oi.*  FROM orders as o INNER JOIN order_item as oi ON o.order_id = oi.order_id WHERE o.order_is_deleted = ? AND user_id = ?', [ 0, user_id ] , (err, result) =>{
            if (err) return res.send(err);

                const data = result.map( item =>{
                    return {...item, items:JSON.parse(item.items)}
                })
            
                return res.json({
                    status: true,
                    msg: 'Orders fetched successfully',
                    data: data
                })
        })
    } catch (error) {
        console.log('Catch an error: ', error);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        }) 
    }
}
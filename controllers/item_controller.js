'user strict';
const sql = require('../connection');

exports.createItem = async (req, res) =>{

    try {
        const { item_name, item_price, restaurant_id, category_id} = req.body;
        const file = req.file

        sql.query('INSERT INTO item(item_name, item_image, item_price, restaurant_id, category_id) VALUES(?,?,?,?,?)', [ item_name, file.path, item_price, restaurant_id, category_id ] , (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Item created successfully'
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

exports.updateItem = async (req, res) =>{

    try {
        const {item_name, item_price, restaurant_id, category_id, item_id} = req.body;
        const file = req.file;

        let query = `UPDATE item SET item_name = ?, item_price = ?, restaurant_id = ?, category_id = ? WHERE item_id = ?`
        let queryValues = [ item_name, item_price, restaurant_id, category_id, item_id] 

        if(file){
            query = `UPDATE item SET item_name = ?, item_image = ?, item_price = ?, restaurant_id = ?, category_id = ? WHERE item_id = ?`
            queryValues = [ item_name, file.path, item_price, restaurant_id, category_id, item_id] 
        }

        sql.query(query, queryValues, (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Item updated successfully'
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

exports.deleteItem = async (req, res) =>{

    try {
        const id = req.query.item_id;
        sql.query('DELETE FROM item WHERE item_id = ?',[ id ], (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Item deleted successfully'
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

exports.getItem = async (req, res) =>{

    try {
        const id = req.query.item_id;
        console.log(req.query)
        sql.query('SELECT * FROM item WHERE item_id = ?', [ id ], (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Item fetched successfully',
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

exports.getItems = async (req, res) =>{

    try {
        sql.query('SELECT * FROM item', (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Items fetched successfully',
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

exports.getClientItems = async (req, res) =>{

    try {
        const { restaurant_id, category_id } = req.query

        sql.query('SELECT * FROM item WHERE restaurant_id = ? AND category_id = ? ', [ restaurant_id, category_id ] , (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Items fetched successfully',
                    data: result
                })
            } else{
                return res.send(err);
            }
        })
    } catch (error) {
        console.log('Catch an error: ', error);
        return res.json({
            status: false,
            msg: 'Something went wrong'
        }) 
    }
}
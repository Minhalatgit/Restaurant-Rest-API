'user strict';
const sql = require('../connection');

exports.createCategory = async (req, res) =>{

    try {
        const { category_name, category_description } = req.body;

        sql.query('INSERT INTO category(category_name, category_description) VALUES(?,?)', [ category_name, category_description ] , (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Category created successfully'
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

exports.getCategories = async (req, res) =>{

    try {

        sql.query('SELECT * FROM category', (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Categories fetched successfully',
                    data : result
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

exports.deleteCategory = async (req, res) =>{

    try {
        const id = req.query.category_id;

        sql.query('DELETE FROM category WHERE category_id = ? ', [ id ], (err, result) =>{
            if (!err) {
                return res.json({
                    status: true,
                    msg: 'Category deleted successfully'
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
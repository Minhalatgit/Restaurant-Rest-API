'user strict';
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const fileFilter = (req, file, cb) =>{
    //reject a file
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null, true)
    } else{
        cb(new Error("Invalid file"), false);
    }
};

const upload = multer({storage: storage, limits:{
    fileSize: 1024 * 1024 *5
},
    fileFilter: fileFilter
})

exports.upload = upload;
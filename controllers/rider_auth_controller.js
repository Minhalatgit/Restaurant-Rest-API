'user strict';
const sql = require('../connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');

const { loginSchema, riderRegisterSchema, riderVerifySchema } = require('../helper/validation_schema');
const TwillioOTP = require('../helper/TwillioOTP');

exports.register = async (req, res) =>{

    try {
        const body = req.body;

        let {license_image, cnic_front, cnic_back} = req.files;
        
        //Validating images that are required for registeration
        if (!license_image || !license_image[0]) {
            return res.json({
                status: false,
                msg: 'License image is required'
            });
        } else if(!cnic_front || !cnic_front[0]){
            return res.json({
                status: false,
                msg: 'Cnic front image is required'
            });
        } else if (!cnic_back || !cnic_back[0]) {
            return res.json({
                status: false,
                msg: 'Cnic back image is required'
            });
        }

        license_image = license_image[0];
        cnic_front = cnic_front[0];
        cnic_back = cnic_back[0];
        
        await riderRegisterSchema.validateAsync(body)
        .then(result =>{
            const { name, phone, email, password, confirm_password, address } = result;

                 //checking if user exists against this email
                 sql.query('SELECT * FROM rider WHERE rider_email = ? OR rider_phone = ?', [ email, phone ], async (err, row) => {
                    if(err) return res.send(err);
                    
                    if(row.length > 0){
                    //user already exists
                        return res.json({
                            status: false,
                            msg: "Email or number is already taken, use another"
                        })
                    }
                    //user not exists 
                    const hashPassword = await bcrypt.hashSync(password, saltRounds);

                    sql.beginTransaction(transactionError =>{
                        if(transactionError) return res.json({
                            status: false,
                            msg: transactionError,
                        });

                        sql.query(`INSERT INTO rider (rider_name, rider_phone, rider_email, rider_password, rider_address, 
                            rider_license_image, rider_cnic_image_front, rider_cnic_image_back) 
                            VALUES (?,?,?,?,?,?,?,?)`, 
                            [name, phone, email, hashPassword, address, license_image.path, cnic_front.path, cnic_back.path] , (err, rows) =>{
                            if(err){
                                return res.json({
                                    status: false,
                                    msg: err,
                                });
                            }

                            TwillioOTP.sendOtp(phone)
                            .then((verification )=>{
                                console.log('OTP sent', verification);
                                sql.commit((commitErr) =>{
                                    if (commitErr) {
                                        sql.rollback(() =>{
                                            return res.json({
                                                status: false,
                                                msg: "Registeration failed, try again",
                                            });
                                        })
                                    }

                                    return res.json({
                                        status: true,
                                        msg: "User registered successfully, check your OTP",
                                    })

                                })
                                
                            }).catch((e) =>{
                                console.log('OTP sending failed', e);
                                sql.rollback(() =>{
                                    return res.json({
                                        status: false,
                                        msg: "Registeration failed, try again",
                                    });
                                })
                            });
                        })
                    })
                
            })

        })
        .catch(err =>{
            return res.json({
                status: false,
                msg: err.details[0].message
            });
        })
    
        } catch(e) {
            console.log('Catch an error: ', e)
            return res.json({
                status: false,
                msg: "Something went wrong",
            }) 
        }
    };

exports.verify = async (req, res) =>{

    try {
        const body = req.body;

        //validating email
        await riderVerifySchema.validateAsync(body)
        .then((result) =>{
            const {phone, verification_code} = result;

            // checking if user exists against this email
            sql.query('SELECT * FROM rider WHERE rider_phone = ?', [ phone ], (err, row) => {
                if(err) return res.send(err);
                    
                    //getting user data from 0 index because it will always have one record per number
                    const riderData = row[0];
                    
                    if(row.length > 0){

                        TwillioOTP.verifyOtp(phone, verification_code)
                        .then(verification_check =>{
                            if(verification_check.valid){
                                //here generate jwt
                                const token = jwt.sign(
                                    {
                                        rider_phone:riderData.rider_phone
                                    },
                                    'SECRETKEY',
                                    {expiresIn: '1h'}
                                );

                                sql.query('UPDATE rider SET rider_jwt = ? WHERE rider_phone = ? ', [1, token, phone] , (err, rows) =>{
                                    if(err){
                                        return res.json({
                                            status: false,
                                            msg: err
                                        });
                                    } 
                                    
                                    return res.json({
                                        status: true,
                                        msg: 'Verified successfully',
                                        data: {
                                            id: riderData.rider_id,
                                            email: riderData.rider_email,
                                            name: riderData.rider_name,
                                            phone: riderData.rider_phone,
                                            address: riderData.user_address,
                                            token
                                        }
                                    });
                                });
                            } else {
                                return res.json({
                                    status: false,
                                    msg: 'Incorrect code'
                                });
                            }
                        })
                        .catch(e =>{
                            return res.send(e);
                        });
                    } else {
                        //user not exists 
                        console.log('User does not exist in db')                
                        return res.json({
                            status: false,
                            msg: 'User does not exist',
                        });
                    }
            });

            }).catch(error =>{
                return res.json({
                    status: false,
                    msg: error.details[0].message
                });
            });
    } catch(e) {
        console.log('Catch an error: ', e);
        return res.json({
            status: false,
            msg: "Something went wrong",
        });
    }
};

exports.login = async (req, res) =>{

    try {
        const body = req.body;

        //validatiing email and password here
        await loginSchema.validateAsync(body)
        .then((result)=>{
            const {email, password} = result;
            //checking if user exists against this email
            sql.query('SELECT * FROM rider WHERE rider_email = ?', [ email ], async (err, row) => {
                if(err) return res.send(err);
                
                if(row.length > 0){

                    //user exists match its email and password
                    const {rider_id, rider_email, rider_name, rider_phone, rider_address, rider_password} = row[0];

                    const hashResult = await bcrypt.compare(password, rider_password);
                    console.log("Hash password", hashResult);

                        // It means password is correctly decryted and matched
                        if(hashResult){
                            const token = jwt.sign(
                                {
                                    rider_phone
                                },
                                'SECRETKEY',
                                {expiresIn: '1h'}
                            );

                            sql.query('UPDATE rider SET rider_jwt = ? WHERE rider_id = ?', [ token, rider_id ], async (err, row) =>{
                                if(err) return res.json({
                                    status: false,
                                    msg: "Something went wrong",
                                });

                                return res.json({
                                    status: true,
                                    msg: "Login successful",
                                    data: {
                                        rider_id,
                                        rider_email,
                                        rider_name,
                                        rider_phone,
                                        rider_address,
                                        token
                                    }
                                });
                            })
                            
                    } else {
                        return res.json({
                            status: false,
                            msg: "Bad credentials"
                        });
                    }

                } else {
                    //user not exists
                    return res.json({
                        status: false,
                        msg: "User not found"
                    });  
                }
            })
        }).catch((error)=>{
            return res.json({
                status: false,
                msg: error.details[0].message
            });
        });
    } catch(e) {
        console.log('Catch an error: ', e)
        return res.json({
            status: false,
            msg: "Something went wrong",
        });
    }
};
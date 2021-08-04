'user strict';
const sql = require('../connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const { loginSchema, registerSchema, verifySchema } = require('../helper/validation_schema');

async function sendEmail(email, code) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Gmail Host
        port: 587, // Port
        secure: false, // this is true as port is 465
        auth: {
            user: 'minhaj123technado@gmail.com', // generated ethereal user
            pass: 'geeks&bachelors', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"minhaj123technado@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Verification Code", // Subject line
        text: `Your verification code is ${code}`, // plain text body
    });

    console.log("Message sent: %s", info);
    console.log("Message sent: %s", info.messageId);

    return info.messageId
}

exports.sendEmail = async (req, res) =>{
    sendEmail("","").then(()=>{
        console.log('Email sent')
            return res.json({
                status: true,
                msg: "User registered successfully, check your email",
            })
    }).catch(()=>{
        console.log('Email sending failed')
        return res.json({
            status: false,
            msg: "Verification failed, try again",
        })
    })
}

exports.register = async (req, res) =>{

    try {
        const body = req.body;
        console.log(body);

        // validating email, password and repeat password
        await registerSchema.validateAsync(body).then((result)=>{
           console.log("Request body is valid");
           
            //checking if user exists against this email
            sql.query('SELECT * FROM user WHERE user_email = ?', [ body.email ], async (err, row) => {
                if(!err) {
                    if(row.length > 0){
                    //user already exists
                        return res.json({
                            status: false,
                            msg: "User already exists"
                        })
                    }
                    //user not exists 

                    const verificationCode = Math.floor(1000 + Math.random() * 9000);

                    const hashPassword = await bcrypt.hashSync(body.password, saltRounds);
                    console.log("Hash password", hashPassword)

                    console.log("User does not exist", verificationCode)

                    sql.query('INSERT INTO user (user_email, user_password, user_verification_code) VALUES (?,?,?)', [body.email, hashPassword, verificationCode] , (err, rows) =>{
                        if(err) return res.json({
                            status: false,
                            msg: err,
                        })  

                        return res.json({
                            status: true,
                            msg: "User registered successfully, check your email",
                        })

                        //send verification code to email of user
                        sendEmail(body.email,verificationCode).then(()=>{
                            console.log('Email sent')
                            return res.json({
                                status: true,
                                msg: "User registered successfully, check your email",
                            })
                        }).catch(()=>{
                            console.log('Email sending failed')
                            return res.json({
                                status: false,
                                msg: "Registeration failed, try again",
                            })
                        })
                    })
            } else{
                res.send(err);
            }
        })
    }).catch((err)=>{
        return res.json({
            status: false,
            msg: err.details[0].message
        })
    });
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
        await verifySchema.validateAsync(body).then((result) =>{

            console.log('Request body is valid');

            // checking if user exists against this email
            sql.query('SELECT * FROM user WHERE user_email = ?', [ body.email ], (err, row) => {
                if(!err) {
                    console.log(row)
                    
                    //getting user data from 0 index because it will always one record per email 
                    const userData = row[0]
                    
                    if(row.length > 0){
                        console.log('User exist in db')

                        console.log(userData)
                        console.log(body.verification_code)

                        if(userData.user_verification_code == body.verification_code){
                            console.log('Code is matched');

                            //here generate jwt
                            const token = jwt.sign({user_email: userData.user_email}, 'SECRETKEY', {expiresIn: '1h'});

                            sql.query('UPDATE user SET user_status = ?, user_token = ? WHERE user_email = ? ', [1, token, body.email] , (err, rows) =>{
                                if(err) return res.json({
                                            status: false,
                                            msg: err
                                        })
                                return res.json({
                                    status: true,
                                    msg: 'Verified successfully',
                                    data: {
                                        id: userData.user_id,
                                        email: userData.user_email,
                                        username: userData.user_name,
                                        user_phone: userData.user_phone,
                                        user_address: userData.user_address,
                                        user_image: userData.user_image,
                                        status: 1,
                                        token
                                }
                                })
                            })  
                            } else {
                                console.log('Code not matched');
                                return res.json({
                                    status: false,
                                    msg: 'Incorrect code'
                                })
                        }

                    } else {
                    //user not exists 
                        console.log('User does not exist in db')                
                        return res.json({
                            status: false,
                            msg: 'User does not exist',
                        })
                    }
                    
                } else{
                    res.send(err);
                }
            })

            }).catch((error)=>{
                return res.json({
                    status: false,
                    msg: error.details[0].message
                })
            })
    } catch(e) {
        console.log('Catch an error: ', e)
        return res.json({
            status: false,
            msg: "Something went wrong",
        }) 
    }
};

exports.login = async (req, res) =>{

    try {
        const body = req.body;

        //validatiing email and password here
        await loginSchema.validateAsync(body).then((result)=>{

                console.log("Email and password is valid")

                //checking if user exists against this email
                sql.query('SELECT * FROM user WHERE user_email = ?', [ body.email ], async (err, row) => {
                    if(!err) {
                        if(row.length > 0){

                            //user exists match its email and password
                            const {user_id, user_email, user_name, user_phone, user_image, user_address, user_status, user_password} = row[0];

                            const hashResult = await bcrypt.compare(body.password, user_password);
                            console.log("Hash password", hashResult)

                                // It means password is correctly decryted and matched
                                if(hashResult){

                                    //here generate jwt
                                    const token = jwt.sign(
                                        {
                                            user_email
                                        },
                                        'SECRETKEY',
                                        {expiresIn: '1h'}
                                    );

                                    sql.query('UPDATE user SET user_token = ? WHERE user_id = ?', [ token, user_id ], async (err, row) =>{
                                        if(err) return res.json({
                                            status: false,
                                            msg: "Something went wrong",
                                        }) 

                                        return res.json({
                                            status: true,
                                            msg: "Login successful",
                                            data: {
                                                user_id,
                                                user_email,
                                                user_name,
                                                user_phone,
                                                user_image,
                                                user_address,
                                                user_status,
                                                token
                                            }
                                        })
                                    })
                                    
                            } else {
                                    return res.json({
                                        status: false,
                                        msg: "Bad credentials"
                                    })
                            }

                        } else {
                            //user not exists
                            return res.json({
                                status: false,
                                msg: "User not found"
                            })  
                        }
                        
                    } else{
                        return res.send(err);
                    }
                })
            }).catch((error)=>{
                return res.json({
                    status: false,
                    msg: error.details[0].message
                })
            })
    } catch(e) {
        console.log('Catch an error: ', e)
        return res.json({
            status: false,
            msg: "Something went wrong",
        }) 
    }
};
const db = require("../database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateJwt } = require("../helpers/generatejwt.js");
const { promisify } = require("util");
const nodemailer=require('nodemailer');


let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service : 'Gmail',
    
    auth: {
      user: 'rachit.taide.551832@gmail.com',
      pass: 'rachit',
    }
    
  });


exports.register = async (req, res) => {
  try {
    const { firstName, lastName, userName, password, email, phone } = req.body;
    //console.log(req.body)
    if (!firstName || !lastName || !userName || !password || !email || !phone) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: "Please provide all details",
      });
    }
    const myQuery =
      "SELECT `phone`,`userName`,`email` FROM `users` WHERE phone = '" +
      phone +
      "' OR userName = '" +
      userName +
      "' OR email = '" +
      email +
      "'";
    //console.log(myQuery, "dddddd");
    let user = await new Promise((resolve, reject) =>
      db.query(myQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    );
    //console.log(user[0], "se");
    if (user.length !== 0) {
      if (
        user[0].phone == phone ||
        user[0].userName == userName ||
        user[0].email == email
      ) {
        return res.status(400).json({
          error: true,
          status: 400,
          message: "phone,username or email is already in use ",
        });
      }
    }
    const salt = await bcrypt.genSalt(10);
    var pass = await bcrypt.hash(password, salt);
    var insertQry = `INSERT INTO users(firstName, lastName, userName,  email, password, phone ) VALUES 
        (  '${firstName}', '${lastName}', '${userName}', '${email}', '${pass}','${phone}' )`;
    //console.log("insertQry",insertQry);
    var query = db.query(insertQry, function (error, results) {
      if (error) {
        return res.status(400).json({
          error: true,
          status: 400,
          message: "Query error",
        });
      }
      // console.log(`Result ${results}`);
      return res.status(200).json({
        code: 200,
        success: "OK",
        message: "Registered successfully",
        data: {},
      });
    });
  } catch (e) {
    console.log(e, "err in register api");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: "Please provide all details",
      });
    }
    const myQuery =
      "SELECT `password`,`userName`,`email` FROM `users` WHERE email = '" +
      email +
      "'";

    let user = await new Promise((resolve, reject) =>
      db.query(myQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    );
    if (user.length == 0) {
      return res.status(404).json({
        error: true,
        status: 404,
        message: "User not found",
      });
    } else {
      const isValid = await bcrypt.compare(password, user[0].password);
      if (!isValid) {
        return res.status(401).json({
          error: true,
          status: 401,
          message: "password incorrect",
        });
      }
      var { error, token } = await generateJwt(user[0].email);
      if(error){
        return res.status(400).json({
            code: 400,
            message: "Couldn't create token",
        });
      }
      var q = db.query(`UPDATE users SET accessToken='${token}' WHERE email='${user[0].email}'`,function(err,re){
        if(err){
          console.log(err)
        }else{
          //console.log(re,'lllll')
        }
      })
      return res.status(200).json({
        code: 200,
        success: "OK",
        message: "login successfully",
        data: {token},
      });
    }
  } catch (e) {
    console.log(e, "err in login api");
  }
};

exports.logout = async (req,res) =>{
    try{
        var update = db.query(`UPDATE users SET accessToken=' ' WHERE email='${req.user[0].email}'`,function(err,re){
            if(err){
              console.log(err)
            }else{
              //console.log(re,'lllll')
            }
          })
          return res.status(200).json({
            code: 200,
            success: "OK",
            message: "logout successfully",
          });
    }catch(e){
        console.log(e,'err in logout')
    }
}

exports.protect = async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
  
    if (!token) {
      return res.status(400).json("Please login to get access");
    }
    let decoded;
    try {
      //var userData = await User.findOne({ accessToken: token });
      const myQuery =
        "SELECT accessToken FROM `users` WHERE accessToken = '" + token + "'";
  
      // getting the result of the query
      let user = await new Promise((resolve, reject) =>
        db.query(myQuery, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        })
      );
  
      if (user.length == 0) {
        result = {
          code: 400,
          status: "Not Found",
          message: `Invalid token`,
          data: {},
        };
        return res.status(400).json(result);
      }
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      //console.log(decoded,'oooo')
    } catch (e) {
      return res.status(401).json("Please login to get access");
    }
    const myQuery =
      "SELECT * FROM `users` WHERE email = '" +
      decoded.email +
      "'";
  
    // getting the result of the query
    let freshUser = await new Promise((resolve, reject) =>
      db.query(myQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    );
    //console.log(freshUser,'mmmm')
    if (freshUser.length == 0) {
      return res.status(401).json("User does not exist");
    }
  
    req.user = freshUser;
  
    next();
};

exports.changePassword = async (req,res) =>{
    try{
        const{oldPassword,newPassword}=req.body;
        const isValid = await bcrypt.compare(oldPassword, req.user[0].password)
        if(!isValid){
            return res.status(401).json({
                error: true,
                status: 401,
                message: "password does not match",
              }); 
        }
        const salt = await bcrypt.genSalt(10);
        var pass = await bcrypt.hash(newPassword, salt);
        var update = db.query(`UPDATE users SET password='${pass}' WHERE email='${req.user[0].email}'`,function(err,re){
            if(err){
              console.log(err)
            }else{
              //console.log(re,'')
            }
          })
          return res.status(200).json({
            code: 200,
            success: "OK",
            message: "Password changed ",
          });

    }catch(e){
        console.log(e,"err in changepassword API")
    }
}

exports.forgotPassword = async (req,res)=>{
    try{
        const { email } = req.body;
        const myQuery =
      "SELECT `phone`,`userName`,`email` FROM `users` WHERE email = '" + email +"'";
    let user = await new Promise((resolve, reject) =>
      db.query(myQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    );
    if(user.length !== 0)
    {
        let otpForEmailVerification = parseInt(Math.random() * 1000000);
        var mailOptions={
            to:email,
            subject:"pass reset",
            html: `<h3> OTP to reset your password : ${otpForEmailVerification} </h3>`
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                return console.log(error)
            }
        })
        var update = db.query(`UPDATE users SET forgotOtp='${otpForEmailVerification}' WHERE email='${email}'`,function(err,re){
            if(err){
              console.log(err)
            }else{
              //console.log(re,'')
            }
          })
          return res.status(200).json({
            code: 200,
            success: "OK",
            message: "OTP sent to mail ",
          });
    }
    return res.status(400).json({
        code: 400,
        success: "Failed",
        message: "EmailId does not exist",
      });
    }catch(e){
        console.log(e,'err in forgotpass')
    }
}

exports.resetPassword = async (req,res)=>{
    try{
        const {email, otp, newPassword} = req.body
        const myQuery =
      "SELECT `forgotOtp`,`email` FROM `users` WHERE email = '" + email +"'";
    let user = await new Promise((resolve, reject) =>
      db.query(myQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    );
    if(user.length !== 0)
    {
    if(user[0].forgotOtp == otp){
        const salt = await bcrypt.genSalt(10);
        var pass = await bcrypt.hash(newPassword, salt);
        var update = db.query(`UPDATE users SET password='${pass}' WHERE email='${user[0].email}'`,function(err,re){
            if(err){
              console.log(err)
            }else{
              //console.log(re,'')
            }
          })
          return res.status(200).json({
            code: 200,
            success: "OK",
            message: "Password changed ",
          });
    }
    return res.status(400).json({
        code: 400,
        success: "Not found",
        message: "otp is incorrect",
      });
    }
    return res.status(404).json({
        code: 404,
        success: "Not found",
        message: "entered email not found",
      });
    }catch(e){
        console.log(e,"err in resetpassword")
    }
}
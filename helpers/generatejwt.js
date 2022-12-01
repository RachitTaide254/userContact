const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});


const options = {
  expiresIn: "7d",
};

async function generateJwt(email) {
  try {
    const payload = { email: email };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, options);
    return { error: false, token: token };
  } catch (error) {
    console.log(error,'error')
    return { error: true };
  }
}

module.exports = { generateJwt };


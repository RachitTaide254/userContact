const express = require('express');
const bodyParser = require('body-parser');

const app = express();


const userRoute = require('./routes/user');
const contactRoute = require('./routes/contact');

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    req.header('Access-Control-Allow-Methods', 'PUT,POST,GET,PATCH,DELETE,')
    return res.status(200).json({});
  }
  next();
});
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//~routes  v0 mean development v1 means production
app.use('/users', userRoute);
app.use('/con', contactRoute);

module.exports = app;

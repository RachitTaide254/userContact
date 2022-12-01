'use strict'
const dotenv = require('dotenv');
const mysql = require('mysql');

const port = process.env.PORT || 5000;
dotenv.config({
  path: './config.env',
});

const app = require('./app');


const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
 
var mysql = require('mysql');
const util = require("util"); 

var db = mysql.createConnection({
    multipleStatements: true,
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DATABASE
  });
  
db.query = util.promisify(db.query).bind(db);

db.connect(function(err) {
  if (err) throw err;
  console.log("mysql connected..");
});

module.exports = db;
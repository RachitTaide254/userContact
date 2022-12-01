const db = require("../database");

exports.addContact = async (req, res) => {
  try {
    const { fullName, address, contact, email, zip} = req.body;
    if ( !fullName || !address || !contact || !email || !zip ) {
        return res.status(400).json({
          error: true,
          status: 400,
          message: "Please provide all details",
        });
      }
    var insertQry = `INSERT INTO contacts(fullName, address, contactNo,  email, zip ,created_by) VALUES 
        (  '${fullName}', '${address}', '${contact}', '${email}', '${zip}','${req.user[0].id}' )`;
    //console.log("insertQry",insertQry);
    var query = db.query(insertQry, function (error, results) {
      if (error) {
        return res.status(400).json({
          error: true,
          status: 400,
          message: "Query error",
        });
      }
      return res.status(200).json({
        code: 200,
        success: "OK",
        message: "User Registered successfully",
        data: {},
      });
    });
  } catch (e) {
    console.log(e, "err in addcontact");
  }
};

exports.getContact =async(req,res)=>{
    try{
    const myQuery =
    "SELECT `fullName`,`address`,`contactNo`,`zip`,`email` FROM `contacts` WHERE created_by = '" + req.user[0].id +"' ";
    //console.log(myQuery, "dddddd");
    let user = await new Promise((resolve, reject) =>
      db.query(myQuery, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    );return res.status(200).json({
        code: 200,
        success: "OK",
        message: "User Registered successfully",
        data: {user},
      });
    }catch(e){
        console.log(e,'err in getcontact')
    }
}
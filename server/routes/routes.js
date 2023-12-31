const express = require("express");
const session = require('express-session'); 

// The router will be added as a middleware and will take control of requests starting with path /record.
const appRouter = express.Router();

appRouter.use(session({secret: "Your secret key"}));

//var session;

const dbo = require("../database/conn");
  
appRouter.route('/').get(function (req, res) {
    // if(!req.session.user){
    //     res.redirect('/login');
    // }
    // res.send("Root directory");
  });

// This section will help you get a list of all the records.
appRouter.route("/products").get(async function (req, res) {
    let db_connect = dbo.getDb("eCommerce");
    const productList = await db_connect.collection("products").find().toArray();
    //console.log(productList);
    res.json(productList);

});
  
// This section will help you create a new user.
appRouter.route("/register").post(function (req, response) {
    let db_connect = dbo.getDb();
    let newUser = {
   firstName: req.body.firstName,
   lastName: req.body.lastName,
   email: req.body.email,
   password: req.body.password,
   gender: req.body.gender,
   address: req.body.address,
 };
 req.session.user = newUser.email;
 console.log(req.session.user);
 db_connect.collection("customers").insertOne(newUser, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});
 
// This section will help you create a new user.
appRouter.route("/login").post(async function (req, response) {
    let db_connect = dbo.getDb();
    let loginCredentials= {
      email: req.body.email,
      password: req.body.password,
    };
    console.log(loginCredentials);
    
    var email = { email: loginCredentials.email };
    const results = await db_connect.collection("customers").find(email,  { _id: 0, "password": 1 }).toArray();
    const db_password = results[0].password;
    console.log(db_password);
    if (db_password == loginCredentials.password) {
        req.session.user = loginCredentials.email;
        console.log(req.session.user);
        response.send("logged in!");
        localStorage.setItem("authenticated", true);
    }
    else{
        response.send("email or/and password is incorrect!");
        localStorage.setItem("authenticated", false);
    }
    
   });

   appRouter.route("/account/:email").get(function (req, res) {
    let db_connect = dbo.getDb();
    let  email = {email: req.params.email };
    db_connect.collection("customers").findOne(email, function (err, result) {
        if (err) throw err;
        res.json(result);
      });
    });

 // This section will help you update a record by id.
 appRouter.route("/update").post(function (req, response) {
  let db_connect = dbo.getDb();
  var myquery = { email: req.body.email }
  let newvalues = {
    $set: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      address: req.body.address,
    },
  };
  
  db_connect.collection("customers").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("Account info updated");
      response.json(res);
    });
 });


module.exports =  appRouter;
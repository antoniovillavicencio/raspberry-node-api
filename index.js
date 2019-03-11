// jshint esversion:6

// MARK: Requires
const express = require('express');
const db = require('./db');


// MARK: Constants 
const PORT = 3000;

// MARK: Initializations and use
let app = express();
// For CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// MARK: Routes
app.get('/', (req, res, next)=> {
    res.json(db.restaurants);
});



// MARK: PORT Listening
app.listen(PORT, ()=> console.log(`Server listening on Port ${PORT}`));

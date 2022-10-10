// use the express library
const express = require('express');
// use the cookieParser library
const cookieParser = require('cookie-parser');

// create a new server application
const app = express();

// Define the port we will listen on
// (it will attempt to read an environment global
// first, that is for when this is used on the real
// world wide web).
const port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieParser());

let nextVisitorId = 1;

app.get('/', (req, res) => {
  res.cookie('visitorId', nextVisitorId);
  res.cookie('visited', Date.now().toString());
  res.render('welcome', {
    name: req.query.name || "World",
    date: new Date().toLocaleString(),
    seconds: Math.ceil((Date.now().toString() - req.cookies.visited) / 1000),
    id: req.cookies['visitorId'] != null ? req.cookies['visitorId'] : nextVisitorId++,
  });
  console.log(req);
});

app.use(express.static('public'));

// Start listening for network connections
app.listen(port);

// Printout for readability
console.log("Server Started!");

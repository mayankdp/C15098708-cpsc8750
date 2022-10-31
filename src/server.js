// use the express library
const express = require('express');

// Server Implementation (Trivia API)
const fetch = require('node-fetch');

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

let nextQuestion = 0;
let options =[];

app.get("/trivia", async (req, res) => {
  // fetch the data
  const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");

  // fail if bad response
  if (!response.ok) {
    res.status(500);
    res.send(`Open Trivia Database failed with HTTP code ${response.status}`);
    return;
  }

  // interpret the body as json
  const content = await response.json();

  // fail if db failed

  if (content.response_code !== 0) {
    res.status(500);
    res.send(`Open Trivia Database failed with internal response code ${content.response_code}`);
    return;
  }

  // respond to the browser
  // TODO: make proper html
  // res.send(JSON.stringify(content, 2));

  const randomNum = Math.floor(Math.random() * 4);
  const correctAnswer = content.results[0].correct_answer;
  const otherOption1 = content.results[0].incorrect_answers[0];
  const otherOption2 = content.results[0].incorrect_answers[1];
  const otherOption3 = content.results[0].incorrect_answers[2];
  if (randomNum == 0) {
    options[0] = correctAnswer;
    options[1] = otherOption1;
    options[2] = otherOption2;
    options[3] = otherOption3;
  } else if (randomNum == 1){
    options[0] = otherOption1;
    options[1] = correctAnswer;
    options[2] = otherOption2;
    options[3] = otherOption3;
  } else if (randomNum == 2){
    options[0] = otherOption2;
    options[1] = otherOption1;
    options[2] = correctAnswer;
    options[3] = otherOption3;
  } else if (randomNum == 3){
    options[0] = otherOption3;
    options[1] = otherOption2;
    options[2] = otherOption1;
    options[3] = correctAnswer;
  }

  // console.log(options);
  // console.log(randomNum);
  const answerLinks = options.map(answer => {
    return `<a href="javascript:alert('${
      answer === correctAnswer ? 'Correct!' : 'Incorrect, Please Try Again!'
      }')">${answer}</a>
    }`
  })

  res.render('trivia', {
    question: content.results[0].question,
    answers: answerLinks,
    category: content.results[0].category,
    difficulty: content.results[0].difficulty,
  });

  nextQuestion++;
});

app.use(express.static('public'));

// Start listening for network connections
app.listen(port);

// Printout for readability
console.log("Server Started!");

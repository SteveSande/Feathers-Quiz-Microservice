// FILE: app.js
// AUTHOR: Steve Sande adapted from Traversy Media https://www.youtube.com/watch?v=8y33WCVkLwc
// DATE CREATED: May 31, 2023
// DESCRIPTION:
//  This is a service prototype for storing multiple choice questions and their answers using Feathers.js
//  The contents of this file provide the microservice functionality.


// feathers provides the API to access and modify a data store
const feathers = require('@feathersjs/feathers');

// express provides the request-response framework
const express = require('@feathersjs/express');

const cors = require("cors");

// socket.io allows a persistent client-server connection to be established
// https://www.youtube.com/watch?v=ZKEqqIO7n-k
const socketio = require('@feathersjs/socketio');


// CLASS: QuestionService
// DESCRIPTION:
//  Feathers.js services are set up as classes.
//  This class provides the data structure for storing questions and applicable CRUD methods.
class QuestionService {
  // keep a questions tally running to act as a primary key
  currentID = 0;  
  
  // METHOD: constructor()
  // DESCRIPTION: 
  //  Sets up the array for storing questions.
  constructor() {
    this.questions = [];
  }

  // METHOD: find()
  // DESCRIPTION: 
  //  This is a service method. All service methods must be async.
  //  It returns all the resources in a service, so in this case that is the questions array.
  // RETURNS: the questions array
  async find() {
    return this.questions;
  }

  // METHOD: create()
  // DESCRIPTION: 
  //  This is a service method. All service methods must be async.
  //  It adds a new question to the questions array.
  // RETURNS: the question struct that was added
  async create(data) {
    // setting up the informal struct based on user data and data structure length
    const question = {
      id: this.currentID,
      question: data.question,
      answers: data.answers,
    };

    // adds the question struct to the array
    this.questions.push(question);
    this.currentID++;

    // returns the question struct
    return question;
  }

  // METHOD: remove()
  // DESCRIPTION: 
  //  This is a service method. All service methods must be async.
  //  It removes a question from the questions array.
  // RETURNS: an array of the removed questions
  async remove(id) {
    let removedQuestions = []
    let index = 0;
    this.questions.forEach((currentElement) => {
      if (currentElement.id == id) {
        removedQuestions.push(this.questions.splice(index, 1));
      }
      index++;
    });

    return removedQuestions;
  }

  // METHOD: update()
  // DESCRIPTION: 
  //  This is a service method. All service methods must be async.
  //  It updates the data for an existing question in the questions array.
  // RETURNS: the updated question data
  async update(id, data) {
    this.questions.forEach((currentElement) => {
      if (currentElement.id == id) {
        currentElement.question = data.question;
        currentElement.answers = data.answers;
        return data;
      }
    });
  }
}

const app = express(feathers());

// app.use() adds middleware functions to the Express middleware stack
// Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.
// The express.json() function is a built-in middleware function in Express. It parses incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// app.configure() is deprecated
// Config Socket.io realtime APIs
app.configure(socketio());
// Enable REST services
app.configure(express.rest());
// Register services 
app.use('/questions', new QuestionService());

// New connections connect to stream channel
app.on('connection', conn => app.channel('stream').join(conn));
// Publish events to stream
app.publish(data => app.channel('stream'));

const PORT = process.env.PORT || 3030;

app.listen(PORT);

// create some generic questions to work with
app.service('questions').create({
  question: 'Who started the fire?',
  answers: ["Patrick", "Jonathan", "Jacky", "Kristian"]
});
app.service('questions').create({
  question: 'What is the best programming language?',
  answers: ["JavaScript", "C#", "C", "Assembly"]
});
app.service('questions').create({
  question: 'Which of the following is true?',
  answers: [
    "If you sever the outer ring of bark on a tree then the tree will die because sap doesn't flow to the roots", 
    "If you sever the outer ring of bark on a tree then the tree will die because sap doesn't flow to the leaves", 
    "Big foot exists", 
    "Gold team rules"]
});

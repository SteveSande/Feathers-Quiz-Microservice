// FILE: app.js
// AUTHOR: Traversy Media https://www.youtube.com/watch?v=8y33WCVkLwc
// DATE CREATED: May 31, 2023
// DESCRIPTION:
//  This is a service prototype for storing multiple choice questions and their answers using Feathers.js
//  The contents of this file provide the back end functionality.


// feathers provides the API to access and modify a data store
const feathers = require('@feathersjs/feathers');

// express provides the request-response framework
const express = require('@feathersjs/express');

// socket.io allows a persistent client-server connection to be established
// https://www.youtube.com/watch?v=ZKEqqIO7n-k
const socketio = require('@feathersjs/socketio');

// The question service
class QuestionService {
  currentID = 0;  
  
  // sets up an empy array in the object
    constructor() {
      this.questions = [];
    }
  
    // find() is a service method, all service methods must be async
    // find() returns all the resources in a service, so in this case that is the ideas array
    async find() {
      return this.questions;
    }
  
    // creates an informal struct and adds it to the array
    async create(data) {
      // setting up the informal struct based on user data and data structure length
      const question = {
        id: this.currentID,
        question: data.question,
        answers: data.answers,
      };
  
      // adds the idea struct to the array
      this.questions.push(question);
      this.currentID++;
  
      // returns the idea struct
      return question;
    }

    async remove(id) {
      let index = 0;
      this.questions.forEach((currentElement) => {
        if (currentElement.id == id) {
          this.questions.splice(index, 1);
        }
        index++;
      });
    }

    async update(id, data) {
      this.questions.forEach((currentElement) => {
        if (currentElement.id == id) {
          currentElement.question = data.question;
          currentElement.answers = data.answers;
        }
      });
    }
}

const app = express(feathers());

// app.use() adds middleware functions to the Express middleware stack
// Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.
// The express.json() function is a built-in middleware function in Express. It parses incoming requests with JSON payloads
app.use(express.json());

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

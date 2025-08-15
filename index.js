const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let exercises = []; // store exercises with userId reference

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = uuidv4();

  const n_user = { username, _id}
  users.push(n_user);

  return res.json(n_user);
});

app.get('api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req,res) => {
  const descrip = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;
  const userId = req.params._id;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'user not found'});
  };

  const exerciseDate = date ? new Date(date) : new Date();

  const newExercise = {
    description: descrip,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    userId
  };

  exercises.push(newExercise);

  return res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
  }
);

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;

  const user = users.find(u => u._id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let userExercises = users.filter(user => user.userId === userId);

  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    userExercises = users.filter(user => new Date(user.date) >= fromDate);
  } 

  if (to) {
    const toDate = new Date(to);
    userExercises = users.filter(user => new Date(user.date) <= toDate);
  } 

  if (limit) {
    userExercises= userExercises.slice(0, parseInt(limit));
  }

  const log = userExercises.map(({ description, duration, date}) => ({description, duration, date}) );

  return res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
  
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


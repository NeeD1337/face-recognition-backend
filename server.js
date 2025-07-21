const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const knex = require('knex')
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
require('dotenv').config();


const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


db.select('*').from('users').then(data => {
    console.log(data);
})

const app = express();

app.use(express.json());
app.use(cors());

app.get("/",(req,res) => {res.send("success");})

app.post("/signin", signin.handleSignin(db,bcrypt,saltRounds));

app.post("/register", (req,res) => {register.handleRegister(req,res,db,bcrypt,saltRounds) })

app.get('/profile/:id', (req,res,db) => { profile.handleProfileGet(req,res,db)})

app.put("/image", (req,res) => {image.handleImage(req,res,db)})

app.post("/clarifai", async (req, res) => {
  const { input } = req.body;

  const PAT = process.env.CLARIFAI_API_KEY;
  const USER_ID = 'clarifai';
  const APP_ID = 'main';
  const MODEL_ID = 'face-detection';
  const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: input,
          },
        },
      },
    ],
  });

  try {
    const response = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Key ${PAT}`,
        },
        body: raw,
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error contacting Clarifai:', error);
    res.status(500).json({ error: 'Failed to fetch from Clarifai API' });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT} 🚀`);
});

import express from 'express';
import connection from './db.js'


const app = express()

app.get('/', function (_req, res) {
  if(connection !== null){
    res.send(`hello world!`);
  } else {
    res.send(' connection failure ');
  }
})


app.listen(3000);

console.log("listening on port 3000");


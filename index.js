const express = require("express");

const app = express();
const port = 3000;

const mongoose = require("mongoose");
const DATABASE_CONNECTION = "mongodb://mongo:27017/database";

mongoose
  .connect(DATABASE_CONNECTION, { useNewUrlParser: true })
  .then(() => {
    console.log("Kopplad databasen");
  })
  .catch(err => {
    throw err;
  });

app.get("/", (req, res) => {
  res.send("Working, we are up and running!");
});

app.listen(port, () => {
  console.log("Lyssnar på port " + port);
});

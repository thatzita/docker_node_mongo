const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
const DATABASE_CONNECTION = "mongodb://192.168.99.100:27017/test";
const app = express();

let Schema = mongoose.Schema;

let pokemonSchema = new Schema(
  {
    name: String
  },
  { collection: "pokemon" }
);

let Pokemon = mongoose.model("Pokemon", pokemonSchema);

mongoose
  .connect(DATABASE_CONNECTION, { useNewUrlParser: true })
  .then(() => {
    console.log("Kopplad till databasen");
  })
  .catch(err => {
    throw err;
  });

app.get("/", (req, res) => {
  res.send("Working, we are up and running! AGAIN! ;)");
});

app.get("/api/gottacatchemall", (req, res) => {
  Pokemon.find().then(doc => {
    console.log(doc);
    res.send(doc);
  });
});

app.listen(port, () => {
  console.log("Lyssnar på port " + port);
});

const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
const DATABASE_CONNECTION = "mongodb://mongo/indulge";
const users = require("./routes/api/users.js");
const locations = require("./routes/api/locations.js");
const locationInfo = require("./routes/api/locationinfo.js");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(DATABASE_CONNECTION, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to database");
  })
  .catch(err => {
    throw err;
  });

//ROUTES
app.use("/api/users", users);
app.use("/api/locations", locations);
app.use("/api/locationinfo", locationInfo);

app.listen(port, () => {
  console.log("Lyssnar på port " + port);
});

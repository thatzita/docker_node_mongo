const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
const DATABASE_CONNECTION = "mongodb://mongo/indulge";
const users = require("./routes/api/users.js");
const locations = require("./routes/api/locations.js");
const locationInfo = require("./routes/api/locationinfo.js");
const cronJob = require("cron").CronJob;
const app = express();
const bodyParser = require("body-parser");

const User = require("../../models/User");

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

var job = new cronJob({
  cronTime: "* * * * * ",
  onTick: function() {
    // call some function.
    // create child process
    // Do whatever you want to do
    User.find()
      .sort({ updatedAt: 1 })
      .limit(2) //oldest first
      .exec((err, data) => {
        if (err) console.log(err);
        data.forEach(user => {
          User.findOneAndUpdate(
            { id: user.id },
            { updatedAt: new Date() },
            (err, doc) => {
              console.log("updated");
            }
          );
          console.log(user.updatedAt);
          console.log(user.full_name);
          console.log("----");
        });
      });
  },
  start: false
});
job.start();

app.listen(port, () => {
  console.log("Lyssnar på port " + port);
});


const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

//EXPORTED FUNCTIONS
const functions = require("./informationFunction.js");

//MONGO DB CONNECTION TO DOCKER CONTAINER
const DATABASE_CONNECTION = "mongodb://mongo/indulge";

//API
const users = require("./routes/api/users.js");
const locations = require("./routes/api/locations.js");
const locationInfo = require("./routes/api/locationInfo.js");

//CRONJOB
const cronJob = require("cron").CronJob;

//MODELS
const User = require("../../models/User");
const Location = require("../../models/Location");

//BODY-PARSER FOR REQUEST/RESPONSE
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//CONNECT TO MONGODB
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

// CRONJOB TICKING EVERY 2ND HOUR - UPDATING FROM USER
// 0 */2 * * *
// var job = new cronJob({
//   // cronTime: "* * * * * ",
//   cronTime: "0 */2 * * *",
//   onTick: function() {
//     User.find()
//       .sort({ updatedAt: 1 })
//       .limit(2) //oldest first
//       .exec((err, data) => {
//         if (err) console.log(err);
//         data.forEach(user => {
//           User.findOneAndUpdate(
//             { id: user.id },
//             { updatedAt: new Date() },
//             (err, doc) => {
//               if (err) console.log(err);
//               functions.facebookPlaces(user);
//             }
//           );
//         });
//       });
//   },
//   start: false
// });
// job.start();

// CRONJOB TICKING EVERY 2ND HOUR - UPDATING FROM LOCATIONS
// 0 */2 * * *
var job = new cronJob({
  cronTime: "* * * * * ",
  // cronTime: "0 */2 * * *",
  onTick: function() {
    Location.find()
      .sort({ updatedAt: 1 })
      .limit(50) //oldest first
      .exec((err, data) => {
        if (err) console.log(err);
        data.forEach(place => {
          Location.findOneAndUpdate(
            { _id: place._id },
            { updatedAt: new Date() },
            (err, doc) => {
              if (err) console.log(err);
              functions.facebookPlaces(place);
            }
          );
        });
      });
  },
  start: false
});
job.start();

app.listen(port, () => {
  console.log("Lyssnar på port " + port);
});

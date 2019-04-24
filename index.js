const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const Geohash = require("latlon-geohash");
const port = 3000;
const DATABASE_CONNECTION = "mongodb://mongo/indulge";
// const DATABASE_CONNECTION = "mongodb://192.168.99.100:27017/indulge";

const users = require("./routes/api/users.js");
const locations = require("./routes/api/locations.js");

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let Schema = mongoose.Schema;

let userSchema = new Schema(
  {
    name: String,
    followers: Number,
    full_name: String,
    profile_picture: String,
    geohash: Array,
    username: String,
    website: String,
    id: String,
    bio: String
  },
  { collection: "users" }
);

const User = mongoose.model("User", userSchema);

let locationSchema = new Schema(
  {
    caption: String,
    followers: Number,
    full_name: String,
    geohash_id: String,
    image: String,
    image_id: String,
    carousel: Array,
    location_info: {
      latitude: String,
      longitude: String,
      name: String
    },
    profile_picture: String,
    user_id: String,
    username: String
  },
  { collection: "locations" }
);

const Location = mongoose.model("Location", locationSchema);

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
app.use("/api/locations/geohash", locations);

//GET USER
// app.get("/api/getuser", (req, res) => {
//   let id = req.query.id;
//   let token = req.query.token;

//   User.findOne({ id: id }, (err, doc) => {
//     if (err) res.send(err);

//     getAllUserInfo(token);
//   });
// });

// async function getAllUserInfo(token) {
//   let userInfo = null;
//   let userData = null;

//   await axios
//     .get(`https://api.instagram.com/v1/users/self/?access_token=${token}`)
//     .then(res => {
//       userInfo = res.data.data;
//     })
//     .catch(err => {
//       console.log(err);
//     });

//   await axios
//     .get(
//       `https://api.instagram.com/v1/users/self/media/recent/?access_token=${token}`
//     )
//     .then(res => {
//       userData = res.data.data;
//     })
//     .catch(err => {
//       console.log(err);
//     });

//   if (userInfo && userData) {
//     let pinArr = [];
//     userData.forEach(info => {
//       if (info.location) {
//         let pictureGeohash = Geohash.encode(
//           info.location.latitude,
//           info.location.longitude
//         ).substring(0, 6);

//         let image_id = info.images.standard_resolution.url;
//         let regex = /([^/]+$)/;
//         let docId = regex.exec(image_id);

//         let caption;
//         if (info.caption !== null) {
//           caption = info.caption.text;
//         } else {
//           caption = "";
//         }

//         if (info.carousel_media) {
//           let carouselArr = [];
//           info.carousel_media.forEach(image => {
//             carouselArr.push(image.images.standard_resolution.url);
//           });

//           let pinInformation = {
//             geohash_id: pictureGeohash,
//             followers: userInfo.counts.followed_by,
//             user_id: userInfo.id,
//             profile_picture: userInfo.profile_picture,
//             username: userInfo.username,
//             full_name: userInfo.full_name,
//             carousel: carouselArr,
//             image: info.images.standard_resolution.url,
//             caption: caption,
//             image_id: docId[0],
//             location_info: {
//               latitude: info.location.latitude,
//               longitude: info.location.longitude,
//               name: info.location.name
//             }
//           };
//           pinArr.push(pinInformation);
//         } else {
//           let pinInformation = {
//             geohash_id: pictureGeohash,
//             followers: userInfo.counts.followed_by,
//             user_id: userInfo.id,
//             profile_picture: userInfo.profile_picture,
//             username: userInfo.username,
//             full_name: userInfo.full_name,
//             image: info.images.standard_resolution.url,
//             image_id: docId[0],
//             caption: caption,
//             location_info: {
//               latitude: info.location.latitude,
//               longitude: info.location.longitude,
//               name: info.location.name
//             }
//           };
//           pinArr.push(pinInformation);
//         }
//       }
//     });

//     let user = {
//       id: userInfo.id,
//       username: userInfo.username,
//       profile_picture: userInfo.profile_picture,
//       full_name: userInfo.full_name,
//       bio: userInfo.bio,
//       website: userInfo.website,
//       followers: userInfo.counts.followed_by,
//       geohash: pinArr //might not be necessary
//     };

//     updateDbWithUser(user);
//     updatePictures(pinArr, userInfo.id);
//   }
// }

//UPDATE LOCATIONS
// async function updatePictures(arr, id) {
//   let pinArr = arr;
//   await Location.deleteMany({ user_id: id }, (err, doc) => {
//     if (err) console.log(err);
//   });

//   await pinArr.forEach(pin => {
//     let query = pin.image_id;
//     let options = {
//       upsert: true,
//       returnOriginal: false
//     };
//     Location.findOneAndUpdate(
//       { image_id: query, user_id: id },
//       pin,
//       options,
//       (err, doc) => {
//         if (err) console.log(err);
//       }
//     );
//   });
// }

// //UPDATE USER
// function updateDbWithUser(user) {
//   let options = {
//     upsert: true,
//     returnOriginal: false
//   };
//   User.findOneAndUpdate({ id: user.id }, user, options, (err, doc) => {
//     if (err) console.log(err);
//     return doc;
//   });
// }

//GEOHASH
// app.put("/api/geohash", (req, res) => {
//   let geohashArr = req.body.data;

//   Location.find()
//     .where("geohash_id")
//     .in(geohashArr)
//     .exec((err, doc) => {
//       if (err) console.log(err);
//       res.send(doc);
//     });
// });

 app.listen(port, () => {
   console.log("Lyssnar på port " + port);
});

const express = require("express");
const router = express.Router();
const axios = require("axios");
const Geohash = require("latlon-geohash");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const type = require("../../categoryList");

// const category = type.category_restaurant;

const User = require("../../models/User");
const LocationInformation = require("../../models/LocationInformation");

router.get("/getuser", (req, res) => {
  let id = req.query.id;
  let token = req.query.token;

  User.findOne({ id: id }, (err, doc) => {
    if (err) res.send(err);
    getAllUserInfo(token);
  });
});

async function getAllUserInfo(token) {
  let userInfo = null;
  let userData = null;

  await axios
    .get(`https://api.instagram.com/v1/users/self/?access_token=${token}`)
    .then(res => {
      userInfo = res.data.data;
    })
    .catch(err => {
      console.log(err);
    });

  await axios
    .get(
      `https://api.instagram.com/v1/users/self/media/recent/?access_token=${token}`
    )
    .then(res => {
      userData = res.data.data;
    })
    .catch(err => {
      console.log(err);
    });

  if (userInfo && userData) {
    let pinArr = [];
    userData.forEach(info => {
      if (info.location) {
        // let pictureGeohash = Geohash.encode(
        //   info.location.latitude,
        //   info.location.longitude
        // );
        LocationInformation.findOne({
          "location_info.name": info.location.name,
          "location_info.latitude": info.location.latitude,
          "location_info.longitude": info.location.longitude
        })
          .then(place => {
            if (place) {
              console.log("typeInfo: ", place.category_list.name);

              //klip in
              let image_id = info.images.standard_resolution.url;
              let regex = /([^/]+$)/;
              let docId = regex.exec(image_id);
              let caption;
              let category_type = "other"; // default type

              if (type.category_restaurant.includes(place.category_list.name)) {
                category_type = "restaurant";
              }

              if (info.caption !== null) {
                caption = info.caption.text;
              } else {
                caption = "";
              }

              if (info.carousel_media) {
                let carouselArr = [];
                info.carousel_media.forEach(image => {
                  carouselArr.push(image.images.standard_resolution.url);
                });

                let pinInformation = {
                  // geohash_id: pictureGeohash,
                  followers: userInfo.counts.followed_by,
                  user_id: userInfo.id,
                  profile_picture: userInfo.profile_picture,
                  category_type: category_type,
                  username: userInfo.username,
                  full_name: userInfo.full_name,
                  carousel: carouselArr,
                  image: info.images.standard_resolution.url,
                  caption: caption,
                  image_id: docId[0],
                  location_info: {
                    type: "Point",
                    coordinates: [
                      info.location.longitude,
                      info.location.latitude
                    ],
                    latitude: info.location.latitude,
                    longitude: info.location.longitude,
                    name: info.location.name
                  }
                };
                pinArr.push(pinInformation);
              } else {
                let pinInformation = {
                  // geohash_id: pictureGeohash,
                  followers: userInfo.counts.followed_by,
                  user_id: userInfo.id,
                  profile_picture: userInfo.profile_picture,
                  category_type: category_type,
                  username: userInfo.username,
                  full_name: userInfo.full_name,
                  image: info.images.standard_resolution.url,
                  image_id: docId[0],
                  caption: caption,
                  location_info: {
                    type: "Point",
                    coordinates: [
                      info.location.longitude,
                      info.location.latitude
                    ],
                    latitude: info.location.latitude,
                    longitude: info.location.longitude,
                    name: info.location.name
                  }
                };
                pinArr.push(pinInformation);
              }

              let user = {
                id: userInfo.id,
                username: userInfo.username,
                profile_picture: userInfo.profile_picture,
                facebook_friends: [],
                facebook_token: null,
                full_name: userInfo.full_name,
                bio: userInfo.bio,
                website: userInfo.website,
                followers: userInfo.counts.followed_by,
                geohash: pinArr //might not be necessary
              };

              updateDbWithUser(user);
              updatePictures(pinArr, userInfo.id);
            } else {
              console.log(
                "could not find a fb place something went wrong in LocationInformation.findOne"
              );
            }
          })
          .catch(err => console.log(err));
      }
    });
  }
}

async function updatePictures(arr, id) {
  let pinArr = arr;
  await Location.deleteMany({ user_id: id }, (err, doc) => {
    if (err) console.log(err);
  });

  await pinArr.forEach(pin => {
    let query = pin.image_id;
    let options = {
      upsert: true,
      returnOriginal: false
    };
    Location.findOneAndUpdate(
      { image_id: query, user_id: id },
      pin,
      options,
      (err, doc) => {
        if (err) console.log(err);
      }
    );
  });
}

//UPDATE USER
function updateDbWithUser(user) {
  let options = {
    upsert: true,
    returnOriginal: false
  };
  User.findOneAndUpdate({ id: user.id }, user, options, (err, doc) => {
    if (err) console.log(err);
    return doc;
  });
}

module.exports = router;

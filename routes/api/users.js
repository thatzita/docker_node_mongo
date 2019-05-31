const express = require("express");
const router = express.Router();
const axios = require("axios");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const type = require("../../categoryList");

const restaurant = type.category_restaurant;
const cafe = type.category_cafe;
const hotel = type.category_hotel;
const bar = type.category_bar;
const shopping = type.category_shopping;
const things_to_do = type.category_things_to_do;
const places_to_visit = type.category_places_to_visit;

const User = require("../../models/User");
const LocationInformation = require("../../models/LocationInformation");

router.post("/getuser", (req, res) => {
  let data = req.body.userData;
  let token = req.body.token;

  let user = {
    id: data.id,
    username: data.username,
    profile_picture: data.profile_picture,
    facebook_friends: [],
    facebook_token: null,
    full_name: data.full_name,
    bio: data.bio,
    website: data.website,
    followers: data.counts.followed_by
  };
  res.send("added/updated in db");
  updateDbWithUser(user, token);
});

router.get("/getuserdata", (req, res) => {
  let id = req.query.token;
  User.findOne({ id: id }, (err, doc) => {
    if (err) res.send(err);
    res.send(doc);
  });
});

async function getAllInstagramPictures(token, userInfo) {
  let pagination, userPictures, userId;
  let user = userInfo;
  let nextUrl;

  await axios
    .get(
      `https://api.instagram.com/v1/users/self/media/recent/?access_token=${token}`
    )
    .then(res => {
      userPictures = res.data.data;
      pagination = res.data.pagination;
      nextUrl = pagination.next_url;
      userId = res.data.data[0].user.id;
    })
    .catch(err => {
      console.log(err);
    });

  if (pagination.next_url) {
    structurePictures(userPictures, user, userId);
    searchMorePictures(nextUrl, user, userId);
  } else {
    structurePictures(userPictures, user, userId);
  }
}

async function searchMorePictures(nextUrl, userInfo, userId) {
  let userData = null;
  let pagination = null;
  let rateLimit;
  await axios
    .get(nextUrl)
    .then(res => {
      rateLimit = res.headers["x-ratelimit-remaining"];
      userData = res.data.data;
      pagination = res.data.pagination;
    })
    .catch(err => {
      console.log(err);
    });

  structurePictures(userData, userInfo, userId);

  if (pagination.next_url !== undefined && rateLimit > 50) {
    searchMorePictures(pagination.next_url, userInfo, userId);
  }
  console.log("Rate limit ", rateLimit);
}

function structurePictures(userPictures, user, userId) {
  let pictureArr = [];
  userPictures.forEach(info => {
    if (info.location) {
      LocationInformation.findOne(
        {
          name: info.location.name,
          latitude: info.location.latitude,
          longitude: info.location.longitude
        },
        (err, doc) => {
          if (err) res.send(err);
          if (doc) {
            let image_id = info.images.standard_resolution.url;
            let regex = /([^/]+$)/;
            let docId = regex.exec(image_id);
            let caption;
            let carouselArr = [];

            let category_type = categorizeImages(doc);

            if (info.carousel_media) {
              info.carousel_media.forEach(image => {
                if (image.images) {
                  carouselArr.push(image.images.standard_resolution.url);
                }
              });
            } else {
              carouselArr = [];
            }

            if (info.caption !== null) {
              caption = info.caption.text;
            } else {
              caption = "";
            }

            let pinInformation = {
              followers: user.followers,
              user_id: user.id,
              profile_picture: user.profile_picture,
              category_type: category_type,
              username: user.username,
              full_name: user.full_name,
              carousel: carouselArr,
              image: info.images.standard_resolution.url,
              caption: caption,
              image_id: docId[0],
              location_info: {
                type: "Point",
                coordinates: [info.location.longitude, info.location.latitude],
                latitude: info.location.latitude,
                longitude: info.location.longitude,
                name: info.location.name
              }
            };
            pictureArr.push(pinInformation);
          } else {
            let image_id = info.images.standard_resolution.url;
            let regex = /([^/]+$)/;
            let docId = regex.exec(image_id);
            let caption;
            let carouselArr = [];

            if (info.carousel_media) {
              info.carousel_media.forEach(image => {
                if (image.images) {
                  carouselArr.push(image.images.standard_resolution.url);
                }
              });
            } else {
              carouselArr = [];
            }

            if (info.caption !== null) {
              caption = info.caption.text;
            } else {
              caption = "";
            }

            let pinInformation = {
              followers: user.followers,
              user_id: user.id,
              profile_picture: user.profile_picture,
              category_type: ["other"],
              username: user.username,
              full_name: user.full_name,
              carousel: carouselArr,
              image: info.images.standard_resolution.url,
              caption: caption,
              image_id: docId[0],
              location_info: {
                type: "Point",
                coordinates: [info.location.longitude, info.location.latitude],
                latitude: info.location.latitude,
                longitude: info.location.longitude,
                name: info.location.name
              }
            };
            pictureArr.push(pinInformation);
          }
          updatePictures(pictureArr, userId);
        }
      );
    }
  });
}

function categorizeImages(doc) {
  let category_type = ["other"];
  doc.category_list.forEach(type => {
    if (restaurant.includes(type.name)) {
      let pop = category_type.filter(x => x !== "other");
      category_type = pop;
      category_type.push("restaurant");
    }
    if (bar.includes(type.name)) {
      let pop = category_type.filter(x => x !== "other");
      category_type = pop;
      category_type.push("bar");
    }
    if (cafe.includes(type.name)) {
      let pop = category_type.filter(x => x !== "other");
      category_type = pop;
      category_type.push("cafe");
    }
    if (hotel.includes(type.name)) {
      let pop = category_type.filter(x => x !== "other");
      category_type = pop;
      category_type.push("hotel");
    }
    if (shopping.includes(type.name)) {
      let pop = category_type.filter(x => x !== "other");
      category_type = pop;
      category_type.push("shopping");
    }
  });
  return category_type;
}

async function updatePictures(arr, id) {
  let pinArr = arr;

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

function updateDbWithUser(user, token) {
  let options = {
    upsert: true,
    returnOriginal: false
  };
  User.findOneAndUpdate({ id: user.id }, user, options, (err, doc) => {
    if (err) console.log(err);
    return doc;
  });
  getAllInstagramPictures(token, user);
}
module.exports = router;

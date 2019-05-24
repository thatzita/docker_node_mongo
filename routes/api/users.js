const express = require("express");
const router = express.Router();
const axios = require("axios");
const Geohash = require("latlon-geohash");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const type = require("../../categoryList");

const restaurant = type.category_restaurant;
const cafe = type.category_cafe;
const hotel = type.category_hotel;
const bar = type.category_bar;
const shoping = type.category_shoping;
const things_to_do = type.category_things_to_do;
const places_to_visit = type.category_places_to_visit;

// const category = type.category_restaurant;

const User = require("../../models/User");
const LocationInformation = require("../../models/LocationInformation");

router.get("/getuser", (req, res) => {
  let id = req.query.id;
  let token = req.query.token;

  User.findOne({ id: id }, (err, doc) => {
    if (err) res.send(err);
    Location.deleteMany({ user_id: id }, (err, doc) => {
      if (err) console.log(err);
    });

    getAllUserInfo(token);
  });
});

async function getAllUserInfo(token) {
  let userInfo = null;
  let userData = null;
  let pagination = null;

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
      pagination = res.data.pagination;
    })
    .catch(err => {
      console.log(err);
    });

  if (userInfo && userData) {
    let pinArr = [];
    userData.forEach(info => {
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
              let category_type = ["other"]; // default type
		//console.log('default ', category_type);

              doc.category_list.forEach(type => {
                if (restaurant.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("restaurant");
                }
                if (bar.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("bar");
                }
                if (cafe.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("cafe");
                }
                if (hotel.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("hotel");
                }
                if (shoping.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("shoping");
                }
              });

              if (info.caption !== null) {
                caption = info.caption.text;
              } else {
                caption = "";
              }

              if (info.carousel_media) {
                let carouselArr = [];
                info.carousel_media.forEach(image => {
                  if (image.images) {
                    carouselArr.push(image.images.standard_resolution.url);
                  }
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

              if (pagination.next_url !== undefined) {
                searchMorePictures(pagination.next_url, userInfo);
              }
              updateDbWithUser(user);
              updatePictures(pinArr, userInfo.id);
            } else {
              console.log(
                "could not find a fb place something went wrong in LocationInformation.findOne"
              );
		
		let image_id = info.images.standard_resolution.url;
              let regex = /([^/]+$)/;
              let docId = regex.exec(image_id);
              let caption;
              let category_type = ["other"]; // default type

              if (info.caption !== null) {
                caption = info.caption.text;
              } else {
                caption = "";
              }

              if (info.carousel_media) {
                let carouselArr = [];
                info.carousel_media.forEach(image => {
                  if (image.images) {
                    carouselArr.push(image.images.standard_resolution.url);
                  }
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

              if (pagination.next_url !== undefined) {
                searchMorePictures(pagination.next_url, userInfo);
              }
		//console.log('place ', pinArr)
              updateDbWithUser(user);
              updatePictures(pinArr, userInfo.id);
              // console.log(info)
            }
          }
        );
      }
    });
  }
}

async function searchMorePictures(url, userInfo) {
  let userData = null;
  let pagination = null;
  await axios
    .get(url)
    .then(res => {
      userData = res.data.data;
      pagination = res.data.pagination;
    })
    .catch(err => {
      console.log(err);
    });

  pins(userData, userInfo);

  if (pagination.next_url !== undefined) {
    searchMorePictures(pagination.next_url, userInfo);
  }
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

function pins(userData, userInfo) {
  let pinArr = [];
  userData.forEach(info => {
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
            let category_type = ["other"]; // default type

           doc.category_list.forEach(type => {
                if (restaurant.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("restaurant");
                }
                if (bar.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("bar");
                }
                if (cafe.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("cafe");
                }
                if (hotel.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("hotel");
                }
                if (shoping.includes(type.name)) {
                  let pop = category_type.filter(x => x !== "other");
                  category_type = pop;
                  //console.log("MATCHING??????", type.name);
                  category_type.push("shoping");
                }
              })

            

            if (info.caption !== null) {
              caption = info.caption.text;
            } else {
              caption = "";
            }

            if (info.carousel_media) {
              let carouselArr = [];
              info.carousel_media.forEach(image => {
                if (image.images) {
                  carouselArr.push(image.images.standard_resolution.url);
                }
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

            updatePictures(pinArr, userInfo.id);
          } else {
            console.log(
              "could not find a fb place something went wrong in LocationInformation.findOne"
            );
          }
        }
      );
    }
  });
}

module.exports = router;


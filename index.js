const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const Geohash = require("latlon-geohash");
const port = 3000;
const DATABASE_CONNECTION = "mongodb://mongo/indulge";
// const DATABASE_CONNECTION = "mongodb://192.168.99.100:27017/indulge";
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let Schema = mongoose.Schema;

// INSTAGRAM USER ON LOGIN
// {
//   "data": {
//       "id": "11386810632",
//       "username": "thatzita",
//       "profile_picture": "https://scontent.cdninstagram.com/vp/0c7aba81874e2c324f7a1c9b6694c3e0/5D3909A0/t51.2885-19/s150x150/52498871_362675917661796_8679496097619509248_n.jpg?_nc_ht=scontent.cdninstagram.com",
//       "full_name": "Terkeliner",
//       "bio": "So we shall flow a river forth to Thee And teeming with souls shall it ever be. In Nomeni Patri Et Fili Spiritus Sancti.",
//       "website": "",
//       "is_business": false,
//       "counts": {
//           "media": 9,
//           "follows": 0,
//           "followed_by": 2
//       }
//   },
//   "meta": {
//       "code": 200
//   }
// }

//USER EXAMPLE
// {"name": "thatzita",
//     "followers": 91239,
//     "full_name": "Robin Udéhn",
//     "profile_picture": "https://scontent.cdninstagram.com/vp/0c7aba81874e2c324f7a1c9b6694c3e0/5D3909A0/t51.2885-19/s150x150/52498871_362675917661796_8679496097619509248_n.jpg?_nc_ht=scontent.cdninstagram.com",
//     "username": "thatzita",
//     "website": "hentaiheaven.org",
// "id":"11386810632",
// "bio": "So we shall flow a river forth to Thee And teeming with souls shall it ever be. In Nomeni Patri Et Fili Spiritus Sancti."
// }

// geohash ={
//   caption: String,
//   followers: Number,
//   full_name: String,
//   geohash_id:String,
//   image: String,
//   image_id:String,
//   location_info: {
//     latitude: String,
//     longitude: String,
//     name: String
//   },
//   profile_picture: String,
//   user_id:String,
//   username: String,
// }

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
    console.log("Kopplad till databasen");
  })
  .catch(err => {
    throw err;
  });

//GET USER
app.get("/api/getuser", (req, res) => {
  // console.log("headers", req.headers.id);
  console.log("request params", req.query.id, req.query.token);
  // console.log("request body", req.body);
  let id = req.query.id;
  let token = req.query.token;

  User.findOne({ id: id }, (err, obj) => {
    if (err) res.send(err);
    if (obj) {
      getAllUserInfo(token);
    } else {
      getAllUserInfo(token);
    }
  });
});

async function getAllUserInfo(token) {
  console.log("instagram token", token);
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
      //console.log(userData);
    })
    .catch(err => {
      console.log(err);
    });

  if (userInfo && userData) {
    let pinArr = [];
    userData.forEach(info => {
      if (info.location) {
	     
        let pictureGeohash = Geohash.encode(
          info.location.latitude,
          info.location.longitude
        ).substring(0, 6);

        let image_id = info.images.standard_resolution.url;
        let regex = /([^/]+$)/;
        let docId = regex.exec(image_id);

        let caption;
        if (info.caption !== null) {
          caption = info.caption.text;
        } else {
          caption = "";
        }

        if (info.carousel_media) {
	//	console.log(info.carousel_media)
          let carouselArr = [];
          info.carousel_media.forEach(image => {
//            console.info(image.images.standard_resolution.url);
            carouselArr.push(image.images.standard_resolution.url);
          });
		console.log("carouselArr", carouselArr)
          let pinInformation = {
            geohash_id: pictureGeohash,
            followers: userInfo.counts.followed_by,
            user_id: userInfo.id,
            profile_picture: userInfo.profile_picture,
            username: userInfo.username,
            full_name: userInfo.full_name,
            carousel: carouselArr,
            image: info.images.standard_resolution.url,
            caption: caption,
            image_id: docId[0],
            location_info: {
              latitude: info.location.latitude,
              longitude: info.location.longitude,
              name: info.location.name
            }
          };
          pinArr.push(pinInformation);
        } else {
          let pinInformation = {
            geohash_id: pictureGeohash,
            followers: userInfo.counts.followed_by,
            user_id: userInfo.id,
		  profile_picture: userInfo.profile_picture,
		  username: userInfo.username,
		  full_name: userInfo.full_name,
            image: info.images.standard_resolution.url,
            image_id: docId[0],
            caption: caption,
            location_info: {
              latitude: info.location.latitude,
              longitude: info.location.longitude,
              name: info.location.name
            }
          };

          pinArr.push(pinInformation);
        }
      }
    });

    let user = {
      id: userInfo.id,
      username: userInfo.username,
      profile_picture: userInfo.profile_picture,
      full_name: userInfo.full_name,
      bio: userInfo.bio,
      website: userInfo.website,
      followers: userInfo.counts.followed_by,
      geohash: pinArr
    };

    updateDbWithUser(user);
    updatePictures(pinArr, userInfo.id);
  }
}

async function updatePictures(arr, id) {
  let pinArr = arr;
	console.log("PINARR", pinArr)
  await Location.deleteMany({ user_id: id }, (err, doc) => {
    if (err) console.log(err);
  });

  await pinArr.forEach(pin => {
//	  console.log("pin",pin);
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
        // console.log(doc);
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

//DELETE USER
app.delete("/api/deleteuser", (req, res) => {
  User.find().then(doc => {
    //    console.log(doc);
    res.send(doc);
  });
});

////////
//GEOHASH//
app.put("/api/geohash", (req, res) => {
  //console.log("body", req.body.data);
  let geohashArr = req.body.data;

  Location.find()
	.where("geohash_id").in(geohashArr).exec((err,doc)=>{
	if(err) console.log(err);
//		console.log(doc)
		res.send(doc)
	})
});
////////

//GET USER PICTURES
app.get("/api/getuser", (req, res) => {
  console.log("headers", req.headers.id);
  console.log("body", req.body);

  User.findOne({ id: req.headers.id }, (err, obj) => {
    if (err) res.send(err);
    if (obj) {
      res.send(obj);
    } else if (obj === null) {
      res.send("User doesn't exist, create one shall we?");
    }
  });
});

//UPDATE USER PICTURES
app.post("/api/updateuser", (req, res) => {
  User.find().then(doc => {
    console.log("userpic", doc);
    res.send(doc);
  });
});

//DELETE USER PICTURES
app.delete("/api/deleteuser", (req, res) => {
  User.find().then(doc => {
    console.log(doc);
    res.send(doc);
  });
});

//GET LOCATION
app.get("/api/getlocation", (req, res) => {
  Location.find().then(doc => {
    console.log(doc);
    res.send(doc);
  });
});

//UPDATE LOCATION
app.post("/api/updatelocation", (req, res) => {
  Location.find().then(doc => {
    console.log(doc);
    res.send(doc);
  });
});

//DELETE LOCATION
app.delete("/api/deletelocation", (req, res) => {
  Location.find().then(doc => {
    console.log(doc);
    res.send(doc);
  });
});

app.listen(port, () => {
  console.log("Lyssnar på port " + port);
});

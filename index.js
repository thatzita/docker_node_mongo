const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
// const DATABASE_CONNECTION = "mongodb://mongo/indulge";
const DATABASE_CONNECTION = "mongodb://192.168.99.100:27017/indulge";
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

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
  console.log("request", req);
  console.log("request body", req.body);

  User.findOne({ id: req.headers.id }, (err, obj) => {
    if (err) res.send(err);
    if (obj) {
      console.log("User exist, update user");
      createUpdateUser();
      res.send(obj);
    } else if (obj === null) {
      createUpdateUser();
      res.send("User doesn't exist, create one shall we?");
    }
  });
});

function createUpdateUser() {
  // console.log("Function to update user or create if non-existing");
}

//UPDATE USER
app.post("/api/updateuser", (req, res) => {
  User.find().then(doc => {
    console.log(doc);
    res.send(doc);
  });
});

//DELETE USER
app.delete("/api/deleteuser", (req, res) => {
  User.find().then(doc => {
    console.log(doc);
    res.send(doc);
  });
});

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
    console.log(doc);
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

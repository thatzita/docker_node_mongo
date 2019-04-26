const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationInformationSchema = new Schema({
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
});

module.exports = LocationInformation = mongoose.model(
  "locationinformation",
  locationInformationSchema
);

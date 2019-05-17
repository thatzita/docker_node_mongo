const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationSchema = new Schema(
  {
    caption: String,
    followers: Number,
    full_name: String,
    // geohash_id: String,
    image: String,
    image_id: String,
    carousel: Array,
    location_info: Object,
    profile_picture: String,
    user_id: String,
    username: String,
    category_type: String
  },
  { timestamps: true }
);

module.exports = Location = mongoose.model("locations", locationSchema);

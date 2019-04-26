const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
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
{timestamps: true}
);

module.exports = User = mongoose.model("users", userSchema);

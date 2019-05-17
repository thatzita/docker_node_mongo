const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    followers: Number,
    full_name: String,
    profile_picture: String,
    facebook_friends: Array,
    facebook_token: String,
    username: String,
    website: String,
    id: String,
    bio: String
  },
  { timestamps: true }
);

module.exports = User = mongoose.model("users", userSchema);

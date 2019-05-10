const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationInformationSchema = new Schema({
  description: String,
  price_range: String,
  about: String,
  name: String,
  latitude: String,
  longitude: String,
  category_list: Array
});

module.exports = LocationInformation = mongoose.model(
  "fbPlace",
  locationInformationSchema
);

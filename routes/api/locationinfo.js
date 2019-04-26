const express = require("express");
const router = express.Router();
const axios = require("axios");
const Geohash = require("latlon-geohash");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const LocationInformation = require("../../models/LocationInformation");

router.put("/fbinfo", (req, res) => {
  let info = req.body.data;
  console.log(info);
  res.send(info);
  //   LocationInformation.find()
  //     .where("geohash_id")
  //     .in(geohashArr)
  //     .exec((err, doc) => {
  //       if (err) console.log(err);
  //       console.log(doc);
  //       res.send(doc);
  //     });
});

module.exports = router;

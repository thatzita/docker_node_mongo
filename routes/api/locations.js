const express = require("express");

const router = express.Router();
const axios = require("axios");
const Geohash = require("latlon-geohash");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const Location = require("../../models/Location");

router.put("/geohash", (req, res) => {
  let geohashArr = req.body.data;

  Location.find()
    .where("geohash_id")
    .in(geohashArr)
    .exec((err, doc) => {
      if (err) console.log(err);
      console.log(doc);
      res.send(doc);
    });
});

module.exports = router;

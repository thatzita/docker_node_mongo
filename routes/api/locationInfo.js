const express = require("express");
const router = express.Router();
const axios = require("axios");
const Geohash = require("latlon-geohash");

const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const LocationInformation = require("../../models/LocationInformation");

router.put("/fbplaces", (req, res) => {
  let info = req.body.data;

  LocationInformation.findOne(
    {
      name: info.name,
      latitude: info.lat,
      longitude: info.lng
    },
    function(err, doc) {
      if (err) console.log(err);
      res.send(doc);
    }
  );
});

module.exports = router;

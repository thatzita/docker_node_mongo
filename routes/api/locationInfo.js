const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const LocationInformation = require("../../models/LocationInformation");
const Location = require("../../models/Location");

router.put("/fbplaces", (req, res) => {
  let info = req.body.data;
  LocationInformation.find(
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

router.put("/placepictures", (req, res) => {
  let info = req.body.data;
  let pictureData;
  Location.find(
    {
      "location_info.name": info.name,
      "location_info.latitude": info.lat,
      "location_info.longitude": info.lng
    },
    function(err, doc) {
      res.send(doc);
    }
  );
});
module.exports = router;

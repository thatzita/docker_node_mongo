const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const Location = require("../../models/Location");

router.put("/geohash", (req, res) => {
  let geohashArr = req.body.data;
  let result = [];
  let locationCounter = 0;
  let shorterResult;
  geohashArr.forEach((location, index, array) => {
    Location.find({ geohash_id: new RegExp(location, "i") }, function(
      err,
      doc
    ) {
      locationCounter++;
      if (doc.length !== 0) result.push(doc);
      if (locationCounter === array.length) {
        if (result.length > 15) {
          shorterResult = result.slice(0, 14);
          res.send(shorterResult);
        } else {
          shorterResult = result;
          res.send(shorterResult);
        }
      }
    });
  });
});

module.exports = router;

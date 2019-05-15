const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const Location = require("../../models/Location");

router.put("/box", (req, res) => {
  let box = req.body.data;
  Location.where("location_info")
    .within()
    .box(box[0], box[1])
    .exec(function(err, data) {
      res.send(data);
    });
});

module.exports = router;

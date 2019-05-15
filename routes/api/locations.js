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
  let finalArr = [];


});

router.put("/box", (req, res) => {
  let box = req.body.data;
  console.log(box);


Location.where('location_info').within().box(box[0], box[1]).exec(function(err,data){
	console.log(data)
res.send(data)
})


});

module.exports = router;


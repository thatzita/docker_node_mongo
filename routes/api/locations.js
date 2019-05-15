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

  // geohashArr.forEach((location, index, array) => {
  //   Location.find({ geohash_id: new RegExp(location, "i") }, function(
  //     err,
  //     doc
  //   ) {
  //     locationCounter++;
  //     if (doc.length !== 0) result.push(doc);
  //     if (locationCounter === array.length) {
  //       shorterResult = result;
  //       shorterResult.forEach(neighbour => {
  //         neighbour.forEach(picture => {
  //           finalArr.push(picture);
  //         });
  //       });
  //       res.send(finalArr);
  //     }
  //   });
  // });
});

router.put("/box", (req, res) => {
  let box = req.body.data;
  // res.send(box);
  console.log(box);
//  Location.within({ box: [box[0],box[1]] })
 // .exec(function(err, doc) {
  //  console.log(doc);
//  });
// Location.find({ location_info: { $geoWithin: { $box: [box[0], box[1]] } } }).exec(function(err,data){
//	console.log(data);
//})

Location.where('location_info').within().box(box[0], box[1]).exec(function(err,data){
	console.log(data)
res.send(data)
})
//Location.where('location_info').within().box(box[0], box[1]).exec((err, data) =>{
//console.log(data)})

//Location.find().where("location_info").within(box[0],box[1])
  // geohashArr.forEach((location, index, array) => {
  //   Location.find({ geohash_id: new RegExp(location, "i") }, function(
  //     err,
  //     doc
  //   ) {
  //     locationCounter++;
  //     if (doc.length !== 0) result.push(doc);
  //     if (locationCounter === array.length) {
  //       shorterResult = result;
  //       shorterResult.forEach(neighbour => {
  //         neighbour.forEach(picture => {
  //           finalArr.push(picture);
  //         });
  //       });
  //       res.send(finalArr);
  //     }
  //   });
  // });
});

module.exports = router;


const express = require("express");
const router = express.Router();
const axios = require("axios");
const Geohash = require("latlon-geohash");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.put("/api/geohash", (req, res) => {
  let geohashArr = req.body.data;

  Location.find()
    .where("geohash_id")
    .in(geohashArr)
    .exec((err, doc) => {
      if (err) console.log(err);
      res.send(doc);
    });
});

app.listen(port, () => {
  console.log("Lyssnar på port " + port);
});

const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const Location = require("../../models/Location");

router.put("/mybox", (req, res) => {
  let data = req.body.data;
  let box = data.box;
  let userId = data.userId;

  Location.where("location_info")
    .within()
    .box(box[0], box[1])
    .exec(function(err, data) {
      let arr = [];
      data.forEach(obj => {
        if (obj.user_id === userId) {
          arr.push(obj);
        }
      });
      res.send(arr);
    });
});

router.put("/box", (req, res) => {
  let reqData = req.body.data;
  let userId = reqData.userId;
  let result;

  Location.where("location_info")
    .within()
    .box(reqData.box[0], reqData.box[1])
    .exec(function(err, data) {
      if (reqData.view === "myView") {
        result = data.filter(
          doc => doc.user_id === userId && doc.category_type === "restaurant"
        );
        result.slice(0, 10);
        res.send(result);
      } else if (reqData.view === "explore") {
        result = data.filter(
          doc => doc.user_id !== userId && doc.category_type === "restaurant"
        );
        let removeDup = removeDuplicates(result, "location_info", "name");
        let sortAfterFollowers = removeDup
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 10);
        res.send(sortAfterFollowers);
      }
    });
});

function removeDuplicates(array, key, key2) {
  let lookup = new Set();
  return array.filter(
    obj => !lookup.has(obj[key][key2]) && lookup.add(obj[key][key2])
  );
}

module.exports = router;


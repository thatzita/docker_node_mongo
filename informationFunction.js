const axios = require("axios");
const LocationInformation = require("../../models/LocationInformation");
// latitude: 57.7079649,
// longitude: 11.9408033,
// name: 'Radisson Blu Riverside Hotel, Gothenburg'

facebookPlaces = data => {
  const token = "530772680664297|AiRN2CSKLnWYiJxtH91A1PUj_aA";

  data.geohash.forEach(place => {
    let lat = place.location_info.latitude;
    let lng = place.location_info.longitude;
    let name = place.location_info.name;

    console.log(place.location_info);
    axios
      .get(
        `https://graph.facebook.com/search?type=place&access_token=${token}&center=${lat},${lng}&fields=location,name,about,category_list,description,payment_options,price_range&distance=10`
      )
      .then(res => {
        let results = res.data.data;

        results.forEach(location => {
          if (location.name === name) {
            let fbPlace = {
              description: location.description,
              price_range: location.price_range,
              about: location.about,
              name: location.name,
              latitude: location.location.latitude,
              longitude: location.location.longitude,
              category_list: location.category_list
            };

            let queryName = fbPlace.name;
            let queryLat = fbPlace.latitude;
            let queryLng = fbPlace.longitude;
            console.log(fbPlace);

            let options = {
              upsert: true,
              returnOriginal: false
            };
            LocationInformation.findOneAndUpdate(
              {
                name: location.name,
                latitude: location.location.latitude,
                longitude: location.location.longitude
              },
              fbPlace,
              options,
              (err, doc) => {
                if (err) console.log(err);
              }
            );
          }
        });
      });
  });
};

module.exports = {
  facebookPlaces: facebookPlaces
};

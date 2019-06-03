const axios = require("axios");
const LocationInformation = require("../../models/LocationInformation");

facebookPlaces = place => {
  // const token = "530772680664297|AiRN2CSKLnWYiJxtH91A1PUj_aA"; //thatzita token
  const token = "604809756608949|Wymhi1EyvPBJvbMsrr2K0n2EAzM"; //indulge token

  let lat = place.location_info.latitude;
  let lng = place.location_info.longitude;
  let name = place.location_info.name;

  axios
    .get(
      `https://graph.facebook.com/search?type=place&access_token=${token}&center=${lat},${lng}&fields=location,name,about,category_list,description,payment_options,price_range&distance=100`
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
};

module.exports = {
  facebookPlaces: facebookPlaces
};

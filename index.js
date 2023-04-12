const { default: axios } = require('axios');
const express = require('express');
const cheerio = require('cheerio');

const app = express();
const port = 9001;
const instagramURL = 'https://instagram.com/p/';

const getImage = async(instagramPostLink) => {
  let response = await axios.get(instagramPostLink);
  if (!response.data) {
    throw new Error('No data found in the response');
  }
  const $ = cheerio.load(response.data);
  const imageLink = $('meta[property="og:image"]').attr('content');
  return imageLink;
};

// const downloadImage = async(imageLink, fileName) => {

// };

app.get('/download/:postCode', async(req, res) => {
  const postCode = req.params.postCode.replace(':', '');
  let instagramPostLink = `${instagramURL}${postCode}`;
  //let instagramPostLink = 'https://instagram.com/p/Cq7wMaNo26q';
  console.log(instagramPostLink);
  let imageLink = await getImage(instagramPostLink);
  console.log("Found: ", imageLink);

});

app.listen(port, () => {
  console.log('listening on port ' + port);
});
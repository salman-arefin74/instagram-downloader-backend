const { default: axios } = require('axios');
const express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');

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

const downloadImage = async(imageLink, fileName) => {
  const imageBuffer = await axios.get(imageLink, {
    responseType: 'arraybuffer'
  });
  fs.writeFileSync(fileName, Buffer.from(imageBuffer.data), 'binary');
};

app.get('/download/:postCode', async(req, res) => {
  const postCode = req.params.postCode.replace(':', '');
  let instagramPostLink = `${instagramURL}${postCode}`; //'https://instagram.com/p/Cq7wMaNo26q'
  console.log(instagramPostLink);
  let imageLink = await getImage(instagramPostLink);
  let imageName = 'downloadedImage.jpg';
  if(imageLink){
    console.log("Found image link, trying to download.");
    await downloadImage(imageLink, imageName);
    res.download(imageName, (err) => {
      if(err){
        console.error("ERROR ! Coudn't download image");
      }
      fs.unlinkSync(imageName);
    });
  }
  else{
    console.error("No image link found, ");
  }
  
});

app.listen(port, () => {
  console.log('listening on port ' + port);
});
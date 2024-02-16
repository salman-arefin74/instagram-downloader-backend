const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');


const app = express();
const port = 9001;
const instagramURL = 'https://instagram.com/p/';

app.use(bodyParser.urlencoded({extended: true}));

app.listen(port, () => {
  console.log('listening on port', port);
});

async function fetchInstagramImage(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const metadata = {};
    metadata.title = $('meta[property="og:title"]').attr('content');
    metadata.description = $('meta[property="og:description"]').attr('content');
    metadata.image = $('meta[property="og:image"]').attr('content');
    metadata.video = $('meta[property="og:video"]').attr('content');

    if (metadata.video) {
      metadata.type = 'video';
      metadata.url = metadata.video;
    } else if (metadata.image) {
      metadata.type = 'image';
      metadata.url = metadata.image;
    } else {
      metadata.type = 'unknown';
    }

    return Promise.resolve(metadata);
  } catch (error) {
    console.error('Error fetching Instagram post: ', error);
    return Promise.reject(new Error('Failed to fetch Instagram post'));
  }
}

function downloadImage(res, url, extension) {
  request(url, {encoding: null}, (error, response, body) => {
    if (error) {
      console.error('Error downloading image: ', error);
      throw new Error('Failed to download image');
    } else {
      const fileName = Date.now() + extension;
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.send(body);
    }
  });
}

app.get('/download/:postCode', async(req, res) => {
  const postCode = req.params.postCode.replace(':', '');
  let instagramPostLink = `${instagramURL}${postCode}`; //'https://instagram.com/p/Cq7wMaNo26q'
  console.log("Instagram post URL: ", instagramPostLink);
  fetchInstagramImage(instagramPostLink).then((response) => {
    console.log("Metadata information of the requested post: ", response);
    downloadImage(res, response.url, '.jpg');
  })
});

app.get('/', (req, res) => {
  res.send('Instagram Downloader');
})

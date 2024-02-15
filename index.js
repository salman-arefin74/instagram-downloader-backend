const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

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
    metadata.url = $('meta[property="og:image"]').attr('content');
    metadata.title = $('meta[property="og:title"]').attr('content');
    metadata.description = $('meta[property="og:description"]').attr('content');
    metadata.image = $('meta[property="og:image"]').attr('content');
    metadata.video = $('meta[property="og:video"]').attr('content');

    if (metadata.video) {
      metadata.type = 'video';
    } else if (metadata.image) {
      metadata.type = 'image';
    } else {
      metadata.type = 'unknown';
    }

    return metadata;
  } catch (error) {
    console.error('Error fetching Instagram post:', error);
    throw new Error('Failed to fetch Instagram post');
  }
}

app.get('/download/:postCode', async(req, res) => {
  const postCode = req.params.postCode.replace(':', '');
  let instagramPostLink = `${instagramURL}${postCode}`; //'https://instagram.com/p/Cq7wMaNo26q'
  console.log(instagramPostLink);
  const imageInfo = await fetchInstagramImage(instagramPostLink);
  console.log(imageInfo);
});

app.get('/', (req, res) => {
  res.send('Hello World');
})

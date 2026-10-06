import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


// Twitter API credentials
const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_KEY_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
}).readWrite;

const videoTweetUrl= "https://x.com/khoon_choos_le/status/1840617572120625549/video/1"

async function tweetWithEmbeddedVideo() {
    try {
      const response = await client.v2.tweet({
        text: videoTweetUrl
      });
      console.log('Tweet sent successfully', response);
      return 'Tweet sent successfully';
    } catch (error) {
      console.error('Error sending tweet:', error);
      console.error('Error details:', error.data);
      return `Error sending tweet: ${error.message}`;
    }
  }
app.get('/tweet', async (req, res) => {
  const providedSecret = req.query.secret;

  if (providedSecret !== process.env.SECRET_KEY) {
    return res.status(403).send('Unauthorized');
  }

  const result = await tweetWithEmbeddedVideo();
  res.send(result);
});

app.get('/', (req, res) => {
  res.send('Twitter bot is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
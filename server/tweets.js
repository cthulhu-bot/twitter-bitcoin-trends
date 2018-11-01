const Twit = require("twit");
const MongoClient = require("mongodb").MongoClient;

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout: 60000
});

const getTweets = insertBitcoin => {
  bot.get("search/tweets", { q: `bitcoin`, count: 100 }, function(
    err,
    data,
    response
  ) {
    if (err) {
      console.log(err);
    } else {
      data.statuses.forEach(function(s) {
        const tweet = { _id: s.id, created_at: s.created_at };
        insertBitcoin(tweet);
      });
    }
  });
};

const insertBitcoinTweet = function(db, tweet, callback) {
  const collection = db.collection("tweets");
  collection.insertOne(tweet, function(err, result) {
    if (err) {
      console.log("mongo insertOne error: ", err);
    } else {
      console.log(`inserted ${JSON.stringify(tweet)} into tweets`);
      callback(result);
    }
  });
};

const checkForTweets = () =>
  MongoClient.connect(
    "mongodb://localhost:27017",
    function(err, client) {
      if (err) {
        console.log("mongo connection error: ", err);
        client.close();
        return;
      } else {
        console.log("Connected successfully to server");
        const db = client.db("test");
        const insertBitcoin = tweet =>
          insertBitcoinTweet(db, tweet, function() {
            client.close();
          });
        getTweets(insertBitcoin);
      }
    }
  );

// poll the endpoint every 10 seconds
setInterval(checkForTweets, 10000);

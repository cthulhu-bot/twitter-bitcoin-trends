const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const fetch = require("node-fetch");

const app = express();

const bitcoinTweets = (startTime, endTime, callback) => {
  MongoClient.connect(
    "mongodb://localhost:27017",
    function(err, client) {
      if (err) {
        console.log("mongo connection error: ", err);
        client.close();
        return;
      } else {
        const db = client.db("test");
        const collection = db.collection("tweets");
        collection.find({}).toArray(function(err, docs) {
          if (err) {
            console.log("mongo connection error: ", err);
            client.close();
            return;
          } else {
            // partition into 1 hour chunks
            const filteredTweets = docs.filter(tweet => tweet.created_at);
            const groupedTweets = filteredTweets.reduce((acc, tweet) => {
              const createdAt = new Date(tweet.created_at);
              createdAt.setMinutes(0);
              createdAt.setSeconds(0);
              createdAt.setMilliseconds(0);
              const truncatedDate = JSON.stringify(
                new Date(
                  createdAt.getFullYear(),
                  createdAt.getMonth(),
                  createdAt.getDate(),
                  createdAt.getHours()
                )
              );
              if (Object.keys(acc).includes(truncatedDate)) {
                acc[`${truncatedDate}`]++;
              } else {
                acc[`${truncatedDate}`] = 1;
                currDtm = truncatedDate;
              }
              return acc;
            }, {});
            client.close();
            callback(groupedTweets);
          }
        });
      }
    }
  );
};

const bitcoinPrice = callback => {
  const url =
    "https://min-api.cryptocompare.com/data/histohour?fsym=BTC&tsym=USD&limit=100";
  return fetch(url)
    .then(resp => {
      return resp.json();
    })
    .then(result => {
      callback(result);
    });
};

app.get("/tweets", (req, res) => {
  bitcoinTweets(null, null, function(docs) {
    res.send(JSON.stringify(docs));
  });
});
app.get("/btc", (req, res) => {
  bitcoinPrice(function(prices) {
    res.send(JSON.stringify(prices.Data));
  });
});
app.listen(5353, () => console.log(`listening on port ${5353}`));

var express = require("express");
var cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

var bodyParser = require("body-parser");

const CLIENT_ID = "98ad48014ecb50454edd";
const CLIENT_SECRET = "367bb3f5689951e69ed26474e9de0cfe38df8605";

var app = express();

app.use(cors());
app.use(bodyParser.json());

app.get(
  "https://televate-1fb46ecbb8ff.herokuapp.com:5000/getAccessToken",
  async function (req, res) {
    const params =
      "?client_id=" +
      CLIENT_ID +
      "&client_secret=" +
      CLIENT_SECRET +
      "&code=" +
      req.query.code;

    await fetch("https://github.com/login/oauth/access_token" + params, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        res.json(data);
      });
  }
);

app.get(
  "https://televate-1fb46ecbb8ff.herokuapp.com:5000/getUserData",
  async function (req, res) {
    req.get("Authorization"); //bearer access token
    await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: req.get("Authorization"),
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        res.json(data);
      });
  }
);

app.listen(4000, function () {
  console.log("CORS server running on port 4000");
});

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

function generateRandomString() {
  var randomId = require('random-id');
  var len = 6;
  var pattern = 'aA0'
  var id = randomId(len, pattern)

  return id;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "flailing-arms"
  }
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,  username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log(urlDatabase);
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"],
  };


  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

app.post("/urls", (req, res) => {
  let long = req.body.longURL;
  let short = generateRandomString();
  urlDatabase[short] = long;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  console.log("SHORT URL", req.params.shortURL)
  console.log("urlDatabase", urlDatabase)
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {

  res.cookie("username", req.body.username);
  console.log(req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {

  res.render("urls_register");
});

app.post("/register", (req, res) =>{
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString();
  users[id] = {
     id: id,
     email: email,
     password: password
   };


  res.cookie("user_id", id); //

  console.log(users);

  if(!email || !password){

    res.status(400).send("Email or Password fields are empty");
  } else {
    res.redirect("/urls");
    }
});


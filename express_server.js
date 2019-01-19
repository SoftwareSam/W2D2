var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
  const bcrypt = require('bcrypt');


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
  "b2xVn2": {
    LURL: "http://www.lighthouselabs.ca",
    user_id: "userRandomID"
  },
  "9sm5xK": {
    LURL: "http://www.google.com",
    user_id: "user2RandomID"
  }
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

function urlsForUser(id) {
  let userURLS = {}

  for(key in urlDatabase){
    if(urlDatabase[key].user_id === id){
      userURLS[key] = urlDatabase[key];
    }
  }
  // when done make the opposite true, where every URL not owned by the user is displayed
  return userURLS;
}

app.get("/urls", (req, res) => {
  let templateVars =
  {
    urls: urlsForUser(req.cookies["user_id"]),
    username: users[req.cookies["user_id"]].email //refresh on this
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  if (req.cookies["user_id"]){
    let templateVars = {
      username: users[req.cookies["user_id"]].email //refresh on this
    };
    return res.render("urls_new", templateVars);

  } else {

    return res.redirect("/register");
  }
});


app.get("/urls/:id", (req, res) => {

  if(req.cookies["user_id"] == urlDatabase[req.params.id].user_id){

    let templateVars =
    {
      shortURL: req.params.id,
      urls: urlDatabase,
      username: users[req.cookies["user_id"]].email,
    };
    res.render("urls_show", templateVars);
  }
  else {
    return res.status(400).send("Error");
  }



});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

app.post("/urls", (req, res) => {



  let long = req.body.longURL;
  let short = generateRandomString();
  urlDatabase[short] = {
    LURL: long,
    user_id: req.cookies.user_id,
  }
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  console.log("PARAMS", req.params)
  console.log("SHORT URL", req.params.shortURL)
  console.log("urlDatabase", urlDatabase)
  let longURL = urlDatabase[req.params.shortURL].LURL;
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {

  if(req.cookies.user_id === urlDatabase[req.params.id].user_id){
    console.log(req.params);
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
  else {
    return res.redirect("/urls");
  }

});



app.get("/login", (req, res) => {

  let templateVars = {
    username: "",
  };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {

  let email = req.body.email;
  let password = req.body.password;

  if(!email || !password) {

    res.status(400).send("Email or Password fields are empty");

  } else {

    for(let key in users){

      if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
                                    // bcrypt.compareSync(password, users[key])
                                    // users[key].password === password
        console.log("Email exists");
        res.cookie("user_id", key);
        console.log(req.body.email);
        return res.redirect("/");

      }
    }

    return res.status(400).send("Wrong Email or Password");

  }

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {

  res.render("urls_register");
});


app.post("/register", (req, res) => {

  let email = req.body.email;
  let password = req.body.password;

  if(!email || !password) {

    res.status(400).send("Email or Password fields are empty");

  } else {

    const hashedPassword = bcrypt.hashSync(password, 10);

    for(let key in users){

      if (users[key].email === email) {
        console.log("Email exists");
        return res.status(400).send("Email already exists");
      }
    }

    let id = generateRandomString();

        users[id] = {
          id: id,
          email: email,
          password: hashedPassword
        };
        res.cookie("user_id", id);
        res.redirect("/urls");
        console.log(users);
   }
});








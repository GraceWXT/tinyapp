const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "admin": {
    id: "admin",
    email: "a@a.com",
    password: "123"
  }
};

// Helper functions
class User {

  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }

}

const generateRandomString = function(length) {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let string = "";
  for (let i = 0; i < length; i ++) {
    string += charset[Math.floor(Math.random() * charset.length)];
  }
  return string;
};

// Routes
// Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// User Registration 
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };    //Need to pass user to all the templates that includes the header partial
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.sendStatus(400);
  }
  const userID = generateRandomString(4);
  const newUser = new User(userID, req.body.email, req.body.password);
  users[userID] = newUser;
  // console.log(users);   // To test the users object is properly being appended to
  res.cookie("user_id", `${userID}`);
  res.redirect(`/urls`);
});

// User Login & Logout
app.post("/login", (req, res) => {
  res.cookie("username", `${req.body.username}`); //need to update this
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Viewing the list of URLs
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
    urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Handling delete request of a certain URL in the list
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Submitting new long URL shortening request
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// Generating Short URLs
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;  // saves the shortURL-longURL key-value pair to the urlDatabase object
  res.redirect(`/urls/${shortURL}`);         // Respond with a redirect to /urls/:shortURL
});

// View for a specific short URL & Updating form
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Handling long URL update
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  urlDatabase[req.params.shortURL] = req.body.longURL;
  const templateVars = {
    user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Redirecting to the corresponding long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
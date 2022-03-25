//
// Dependencies
//
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { User, ShortURL, generateRandomString, findUserByEmail, urlsForUser, notLoggedIn, shortURLnotExist, urlNotOwned } = require("./helper_functions");

//
// Config
//
const PORT = 8080;
const app = express();
app.set("view engine", "ejs");

//
// Middleware
//
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'userID',
  keys: ["WhuRJ9gaZ2", "UiR57Ijf7V", "HyD60Aqac5"]
}));

//
// Database
//
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "admin"
  }
};

const users = {
  "admin": {
    id: "admin",
    email: "a@a.com",
    hashedPassword: bcrypt.hashSync("123")
  }
};

const errMsg = {
  "notLoggedIn" : {
    title: "Permission Denied",
    detail: "Please log in to access this content."
  },
  "shortURLnotExist": {
    title: "Invalid Short URL",
    detail: "Please double check the short URL exists."
  },
  "urlNotOwned": {
    title: "Permission Denied",
    detail: "You don't have access to this content."
  }
};

//
// Routes
//
// Homepage
app.get("/", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    return res.redirect("/urls");
  }
  res.send("Hello!");
});

// User Registration
app.get("/register", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };    //Need to pass user to all the templates that includes the header partial
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.sendStatus(400);
  }
  const user = findUserByEmail(email, users);
  if (user) {
    return res.sendStatus(400);
  }
  const userID = generateRandomString(4);
  const hashedPassword = bcrypt.hashSync(password);
  const newUser = new User(userID, email, hashedPassword);
  users[userID] = newUser;
  // console.log(users);   // To test the users object is properly being appended to
  req.session.userID = userID;
  res.redirect("/urls");
});

// User Login
app.get("/login", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  if (!user) {
    return res.sendStatus(403);
  }
  const passwordMatches = bcrypt.compareSync(password, user.hashedPassword);
  if (!passwordMatches) {
    return res.sendStatus(403);
  }
  req.session.userID = user.id;
  res.redirect("/urls");
});

// User Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Viewing the list of URLs
app.get("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    const error = errMsg.notLoggedIn;
    return res.render("error", {error, user});
  }
  const urlList = urlsForUser(user.id, urlDatabase);
  const templateVars = {
    user,
    urlList
  };
  res.render("urls_index", templateVars);
});

// Handling delete request of a certain URL in the list
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    const error = errMsg.notLoggedIn;
    return res.render("error", {error, user});
  }
  const { shortURL } = req.params;
  if (shortURLnotExist(shortURL, urlDatabase)) {
    const error = errMsg.shortURLnotExist;
    return res.render("error", {error, user});
  }
  if (urlNotOwned(shortURL, user, urlDatabase)) {
    const error = errMsg.urlNotOwned;
    return res.render("error", {error, user});
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Submitting new long URL shortening request
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userID];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// Generating Short URLs
app.post("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    const error = errMsg.notLoggedIn;
    return res.render("error", {error, user});
  }
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = new ShortURL(longURL, user.id);
  // console.log(urlDatabase); // To test the urlDatabse object is properly updated
  res.redirect(`/urls/${shortURL}`);
});

// View for a specific short URL & Updating form
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    const error = errMsg.notLoggedIn;
    return res.render("error", {error, user});
  }
  const { shortURL } = req.params;
  if (shortURLnotExist(shortURL, urlDatabase)) {
    const error = errMsg.shortURLnotExist;
    return res.render("error", {error, user});
  }
  if (urlNotOwned(shortURL, user, urlDatabase)) {
    const error = errMsg.urlNotOwned;
    return res.render("error", {error, user});
  }
  const templateVars = {
    user,
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

// Handling long URL update
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    const error = errMsg.notLoggedIn;
    return res.render("error", {error, user});
  }
  const { shortURL } = req.params;
  if (shortURLnotExist(shortURL, urlDatabase)) {
    const error = errMsg.shortURLnotExist;
    return res.render("error", {error, user});
  }
  if (urlNotOwned(shortURL, user, urlDatabase)) {
    const error = errMsg.urlNotOwned;
    return res.render("error", {error, user});
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  const templateVars = {
    user,
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);   // final requirement is redirect?
});

// Redirecting to the corresponding long URL
app.get("/u/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  const { shortURL } = req.params;
  if (shortURLnotExist(shortURL, urlDatabase)) {
    const error = errMsg.shortURLnotExist;
    return res.render("error", {error, user});
  }
  const longURL = urlDatabase[shortURL].longURL;
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
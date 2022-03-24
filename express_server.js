//
// Dependencies
//
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

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
app.use(cookieParser());

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
    password: "123"
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
  "UrlNotOwned": {
    title: "Permission Denied",
    detail: "You don't have access to this content."
  }
};

//
// Helper functions
//
class User {

  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }

}

class ShortURL {

  constructor(longURL, userID) {
    this.longURL = longURL;
    this.userID = userID;
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

const findUserByEmail = function(email) {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
};

const urlsForUser = function(id) {
  let list = {};
  for (let shortURL in urlDatabase) {
    let url = urlDatabase[shortURL];
    if (url.userID === id) {
      list[shortURL] = url;
    }
  }
  return list;
};

const handleError = function(errorType, res, user, shortUrlInReq = undefined) {
  switch (errorType) {
  case "notLoggedIn":
    if (!user) {
      const error = errMsg.notLoggedIn;
      const templateVars = {
        user,
        error
      };
      return res.render("error", templateVars);
    }
    break;
  case "shortURLnotExist":
    if (!urlDatabase[shortUrlInReq]) {
      const error = errMsg.shortURLnotExist;
      const templateVars = {
        user,
        error
      };
      return res.render("error", templateVars);
    }
    break;
  case "UrlNotOwned":
    if (urlDatabase[shortUrlInReq].userID !== user.id) {
      const error = errMsg.UrlNotOwned;
      const templateVars = {
        user,
        error
      };
      return res.render("error", templateVars);
    }
    break;
  }
};
//
// Routes
//
// Homepage
app.get("/", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  res.send("Hello!");
});

// User Registration
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };    //Need to pass user to all the templates that includes the header partial
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  if (inputEmail === "" || inputPassword === "") {
    return res.sendStatus(400);
  }
  if (findUserByEmail(inputEmail)) {
    return res.sendStatus(400);
  }
  const userID = generateRandomString(4);
  const newUser = new User(userID, inputEmail, inputPassword);
  users[userID] = newUser;
  // console.log(users);   // To test the users object is properly being appended to
  res.cookie("user_id", `${userID}`);
  res.redirect("/urls");
});

// User Login
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const user = findUserByEmail(inputEmail);
  if (!user) {
    return res.sendStatus(403);
  }
  const expectedPassword = user.password;
  if (inputPassword !== expectedPassword) {
    return res.sendStatus(403);
  }
  res.cookie("user_id", `${user.id}`);
  res.redirect("/urls");
});

// User Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Viewing the list of URLs
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  handleError("notLoggedIn", res, user);
  const urlList = urlsForUser(user.id);
  const templateVars = {
    user,
    urlList
  };
  res.render("urls_index", templateVars);
});

// Handling delete request of a certain URL in the list
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.cookies["user_id"]];
  handleError("notLoggedIn", res, user);
  const shortUrlInReq = req.params.shortURL;
  handleError("shortURLnotExist", res, user, shortUrlInReq);
  handleError("UrlNotOwned", res, user, shortUrlInReq);
  delete urlDatabase[shortUrlInReq];
  res.redirect("/urls");
});

// Submitting new long URL shortening request
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// Generating Short URLs
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  handleError("notLoggedIn", res, user);
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = new ShortURL(longURL, user.id);
  // console.log(urlDatabase); // To test the urlDatabse object is properly updated
  res.redirect(`/urls/${shortURL}`);
});

// View for a specific short URL & Updating form
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  handleError("notLoggedIn", res, user);
  const shortUrlInReq = req.params.shortURL;
  handleError("shortURLnotExist", res, user, shortUrlInReq);
  handleError("UrlNotOwned", res, user, shortUrlInReq);
  const templateVars = {
    user,
    shortURL: shortUrlInReq,
    longURL: urlDatabase[shortUrlInReq].longURL
  };
  res.render("urls_show", templateVars);
});

// Handling long URL update
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  handleError("notLoggedIn", res, user);
  const shortUrlInReq = req.params.shortURL;
  handleError("shortURLnotExist", res, user, shortUrlInReq);
  handleError("UrlNotOwned", res, user, shortUrlInReq);
  urlDatabase[shortUrlInReq].longURL = req.body.longURL;
  const templateVars = {
    user,
    shortURL: shortUrlInReq,
    longURL: urlDatabase[shortUrlInReq].longURL
  };
  res.render("urls_show", templateVars);   // final requirement is redirect?
});

// Redirecting to the corresponding long URL
app.get("/u/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortUrlInReq = req.params.shortURL;
  handleError("shortURLnotExist", res, user, shortUrlInReq);
  const longURL = urlDatabase[shortUrlInReq].longURL;
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
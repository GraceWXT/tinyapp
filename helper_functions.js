//
// Helper functions
//
class User {

  constructor(id, email, hashedPassword) {
    this.id = id;
    this.email = email;
    this.hashedPassword = hashedPassword;
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

const findUserByEmail = function(email, users) {
  const members = Object.values(users)
  for (let user of members) {
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id, urlDatabase) {
  let list = {};
  for (let shortURL in urlDatabase) {
    let url = urlDatabase[shortURL];
    if (url.userID === id) {
      list[shortURL] = url;
    }
  }
  return list;
};

const notLoggedIn = (user) => {
  if (!user) {
    return true;
  }
  return false;
};

const shortURLnotExist = (shortURL, urlDatabase) => {
  if (!urlDatabase[shortURL]) {
    return true;
  }
  return false;
};

const urlNotOwned = (shortURL, user, urlDatabase) => {
  if (urlDatabase[shortURL].userID !== user.id) {
    return true;
  }
  return false;
};


module.exports = { User, ShortURL, generateRandomString, findUserByEmail, urlsForUser, notLoggedIn, shortURLnotExist, urlNotOwned }
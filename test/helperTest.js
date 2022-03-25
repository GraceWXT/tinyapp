const { assert } = require("chai");

const { findUserByEmail } = require("../helper_functions");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, testUsers[expectedUserID]);
  });
  it("should return null if the email is not in the database", function() {
    const user = findUserByEmail("nouser@example.com", testUsers);
    const expectedUser = null;
    assert.equal(user, expectedUser);
  });
});
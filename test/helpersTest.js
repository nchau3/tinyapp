const { assert } = require('chai');

const { generateRandomString, userLookupByEmail, urlsForUser } = require('../helpers.js');

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

const testURLs = {
    "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: 'testUser'
    },
    "errRi4": {
      longURL: "http://www.notawebsite.org",
      userID: 'player1'
    },
  };

//generateRandomString
describe('generateRandomString', function() {
  it('should (most likely) return a different string with each use', function() {
    const test1 = generateRandomString();
    const test2 = generateRandomString();
    assert.notEqual(test1, test2);
  });
});

//userLookupByEmail
describe('userLookupByEmail', function() {
  it('should return a user with valid email', function() {
    const user = userLookupByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
});

describe('userLookupByEmail', function() {
  it('should return null if email is invalid', function() {
    const user = userLookupByEmail(testUsers, "invalid@notawebsite.com")
    assert.strictEqual(user, null);
  });
});

//urlsForUser
describe('urlsForUser', function() {
  it('should only return URLs that match userID', function() {
    const myURLs = urlsForUser(testURLs, "player1");
    assert.deepEqual(myURLs, {
      "errRi4": {
        longURL: "http://www.notawebsite.org",
        userID: 'player1'
      }
    });
  });
});

describe('urlsForUser', function() {
  it('should return empty object if no matches are found', function() {
    const myURLs = urlsForUser(testURLs, "invalidID");
    assert.deepEqual(myURLs, {});
  });
});
const generateRandomString = function() {
  let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let newString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    newString += charSet[randomIndex];
  }
  return newString;
};

const userLookupByEmail = function(database, email) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function(database, userID) {
  let myDatabase = {};
  for (let url in database) {
    const userMatch = database[url]['userID'];
    if (userMatch === userID) {
      myDatabase[url] = database[url];
    }
  }
  return myDatabase;
};

module.exports = { generateRandomString, userLookupByEmail, urlsForUser };
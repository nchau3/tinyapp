class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}

class URL {
  constructor(longURL, userID) {
    this.longURL = longURL;
    this.userID = userID;
  }
}

module.exports = { User, URL };
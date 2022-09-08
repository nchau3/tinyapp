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
    this.visits = [];
    this.visitors = [];
  }

  addVisit(visitorID) {
    const visitor = visitorID;
    const date = new Date().toLocaleString("en-US", { hour12: true, timeZoneName: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const newVisit = { visitor, date }
    this.visits.push(newVisit);
  }

}

module.exports = { User, URL };
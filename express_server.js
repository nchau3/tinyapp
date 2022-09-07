const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const { generateRandomString, userLookupByEmail, urlsForUser } = require('./helpers');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'testUser'
  }
};

const users = {
  sample: {
    id: 'sample',
    email: 'sample@sample.com',
    password: '123mypassword'
  }
};

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

//go to homepage
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//go to homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: undefined, user: undefined};
  if (req.cookies["user_id"]) {
    const userID = req.cookies["user_id"];
    templateVars.user = users[userID];
    templateVars.urls = urlsForUser(urlDatabase, userID);
  }
  res.render('urls_index', templateVars);
});

//create new URL
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const newID = generateRandomString();
  urlDatabase[newID] = new URL(req.body.longURL, userID);
  res.redirect(`/urls/${newID}`);
});

//go to create page
app.get("/urls/new", (req, res) => {
  //login before creating new urls
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  }
  const templateVars = { user: undefined };
  if (req.cookies) {
    const userID = req.cookies["user_id"];
    templateVars.user = users[userID];
  }
  res.render("urls_new", templateVars);
});


//go to long URL
app.get("/u/:id", (req, res) => {
  const key = req.params.id;
  const longURL = urlDatabase[key];
  if (!longURL) {
    res.statusCode = 404;
    res.send("Requested URL does not exist.");
  } else {
    res.redirect(longURL);
  }
});

//delete URL
app.post("/urls/:id/delete", (req, res) => {
  //must be logged in
  if (!req.cookies["user_id"]) {
    res.statusCode = 403;
    res.send("Please login to continue.");
  }
  const id = req.params.id;
  const userID = req.cookies["user_id"];

  //url must exist in database
  if (!urlDatabase[id]) {
    res.statusCode = 404;
    res.send("Requested URL does not exist.");
  }
  //url must be associated with user
  if (urlDatabase[id].userID !== userID) {
    res.statusCode = 403;
    res.send("This URL is not associated with this account.");
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//update URL
app.post("/urls/:id/", (req, res) => {
  //must be logged in
  if (!req.cookies["user_id"]) {
    res.statusCode = 403;
    res.send("Please login to continue.");
  }

  const id = req.params.id;
  const userID = req.cookies["user_id"];

  //url must exist in database
  if (!urlDatabase[id]) {
    res.statusCode = 404;
    res.send("Requested URL does not exist.");
  }
  //url must be associated with user
  if (urlDatabase[id].userID !== userID) {
    res.statusCode = 403;
    res.send("This URL is not associated with this account.");
  }

  urlDatabase[id] = req.body.updatedURL;
  res.redirect('/urls');
});

//go to login page
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
  }
  const templateVars = { user: undefined };
  res.render("urls_login", templateVars);
});

//login
app.post("/login", (req, res) => {
  //empty fields, return error
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send("Please enter email and password.");
  }
  const userEmail = req.body.email;
  const passwordEntered = req.body.password;
  const checkUser = userLookupByEmail(users, userEmail);

  if (!checkUser) {
    res.statusCode = 403;
    res.send("Email not found.");
  }
  if (!bcrypt.compareSync(passwordEntered, users[checkUser].password)) {
    res.statusCode = 403;
    res.send("Password does not match for his email address.");
  }
  res.cookie('user_id', checkUser);
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//go to register page
app.get("/register", (req, res) => {
  //redirect if logged in
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
  }
  const templateVars = { user: undefined };
  if (req.cookies) {
    const userID = req.cookies["user_id"];
    templateVars.user = users[userID];
  }
  res.render("urls_register", templateVars);
});

//go to short URL confirmation/update page
app.get("/urls/:id", (req, res) => {
  //must be logged in
  if (!req.cookies["user_id"]) {
    res.statusCode = 403;
    res.send("Please login to continue.");
  }

  const id = req.params.id;
  const userID = req.cookies["user_id"];

  //url must exist in database
  if (!urlDatabase[id]) {
    res.statusCode = 404;
    res.send("Requested URL does not exist.");
  }
  //url must be associated with user
  if (urlDatabase[id].userID !== userID) {
    res.statusCode = 403;
    res.send("This URL is not associated with this account.");
  }
  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user: users[userID]
  };
  res.render('urls_show', templateVars);
});

//adds new user with email & password, stores to users database
app.post("/register", (req, res) => {
  //empty fields, return error
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send("Please enter email and password");
  }
  //email already exists, return error
  if (userLookupByEmail(users, req.body.email)) {
    res.statusCode = 400;
    res.send("This email already exists.");
  }
  const newID = generateRandomString();
  hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newID] = new User(newID, req.body.email, hashedPassword);
  res.cookie('user_id', newID);
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
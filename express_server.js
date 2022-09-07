const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['userID'],
  maxAge: 2 * 60 * 60 * 1000 // 2 hours expiry
}));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const { User, URL } = require('./classes');
const { generateRandomString, userLookupByEmail, urlsForUser } = require('./helpers');
const urlDatabase = {};
const users = {};

//redirect main directory to /urls
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//go to homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: undefined, user: undefined};
  const {userID} = req.session;
  if (userID) {
    templateVars.user = users[userID];
    templateVars.urls = urlsForUser(urlDatabase, userID);
  }
  res.render('urls_index', templateVars);
});

//go to create page
app.get("/urls/new", (req, res) => {
  const {userID} = req.session;
  const templateVars = { user: users[userID] };
  //login before creating new urls
  if (!userID) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

//go to login page
app.get("/login", (req, res) => {
  const {userID} = req.session;
  const templateVars = { user: undefined };
  if (userID) {
    res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const checkUser = userLookupByEmail(users, email);
  //empty fields, return error
  if (!email || !password) {
    res.statusCode = 400;
    res.send("Please enter email and password.");
  }
  if (!checkUser) {
    res.statusCode = 403;
    res.send("Email not found.");
  }
  if (!bcrypt.compareSync(password, users[checkUser].password)) {
    res.statusCode = 403;
    res.send("Password does not match for his email address.");
  }
  req.session.userID = checkUser;
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//go to register page
app.get("/register", (req, res) => {
  const {userID} = req.session;
  const templateVars = { user: undefined };
  //redirect if logged in
  if (userID) {
    res.redirect('/urls');
  }
  res.render("urls_register", templateVars);
});

//adds new user with email & password, stores to users database
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  //empty fields, return error
  if (!email || !password) {
    res.statusCode = 400;
    res.send("Please enter email and password");
  }
  //email already exists, return error
  if (userLookupByEmail(users, email)) {
    res.statusCode = 400;
    res.send("This email already exists.");
  }
  const newID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[newID] = new User(newID, email, hashedPassword);
  req.session.userID = newID;
  res.redirect(`/urls/`);
});

//create new URL
app.post("/urls", (req, res) => {
  const {userID} = req.session;
  const {longURL} = req.body;
  //must be logged in
  if (!userID) {
    res.statusCode = 403;
    res.send("Please login to continue.");
  }
  const newID = generateRandomString();
  urlDatabase[newID] = new URL(longURL, userID);
  res.redirect(`/urls/${newID}`);
});

//go to short URL confirmation/update page
app.get("/urls/:id", (req, res) => {
  const {userID} = req.session;
  const {id} = req.params;
  //must be logged in
  if (!userID) {
    res.statusCode = 403;
    res.send("Please login to continue.");
  }
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

//go to long URL
app.get("/u/:id", (req, res) => {
  const {id} = req.params;
  if (!urlDatabase[id]) {
    res.statusCode = 404;
    res.send("Requested URL does not exist.");
  }
  const {longURL} = urlDatabase[id];
  res.redirect(longURL);
});

//update URL
app.put("/urls/:id", (req, res) => {
  const {userID} = req.session;
  const {id} = req.params;
  const {updatedURL} = req.body;
  //must be logged in
  if (!userID) {
    res.statusCode = 403;
    res.send("Please login to continue.");
  }
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
  urlDatabase[id].longURL = updatedURL;
  res.redirect('/urls');
});

  //delete URL
app.delete("/urls/:id", (req, res) => {
  const {userID} = req.session;
  const {id} = req.params;
  //must be logged in
  if (!userID) {
    res.statusCode = 403;
    res.send("Please login to continue.");
  }
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
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const generateRandomString = function() {
  let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let newString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    newString += charSet[randomIndex];
  }
  return newString;
};

const userLookupByEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}

const users = {
  sample: {
    id: 'sample',
    email: 'sample@sample.com',
    password: '123mypassword'
  }
};

//go to homepage
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//go to homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: undefined};
  console.log(req.cookies["user_id"]);
  if (req.cookies) {
    const userID = req.cookies["user_id"];
    templateVars.user = users[userID];
  }
  res.render('urls_index', templateVars);
});

//create new URL
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.statusCode = 403;
    res.send("Please login or sign up to shorten URLs.");
  }
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
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

//open link for short URL
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: undefined };
  if (req.cookies) {
    const userID = req.cookies["user_id"];
    templateVars.user = users[userID];
  }
  res.render('urls_show', templateVars);
});

//delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//update URL
app.post("/urls/:id/", (req, res) => {
  const id = req.params.id;
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
  const checkUser = userLookupByEmail(req.body.email);
  if (!checkUser) {
    res.statusCode = 403;
    res.send("Email not found.");
  }
  if (users[checkUser].password !== req.body.password) {
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

//go to register page CHANGE
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

//adds new user with email & password, stores to users database
app.post("/register", (req, res) => {
  //empty fields, return error
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send("Please enter email and password");
  }
  //email already exists, return error
  if (userLookupByEmail(req.body.email)) {
    res.statusCode = 400;
    res.send("This email already exists.");
  }
  const newID = generateRandomString();
  users[newID] = new User(newID, req.body.email, req.body.password);
  res.cookie('user_id', newID);
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
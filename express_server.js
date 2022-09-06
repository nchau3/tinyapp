const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser())
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  let newString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    newString += charSet[randomIndex];
  }
  return newString;
};

function userLookupByEmail(email) {
  for (user in users) {
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
}

//go to homepage
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//go to homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: undefined};
  if (req.cookies) {
    const userID = req.cookies["user_id"];
    templateVars.user = users[userID];
  }
  console.log(templateVars)
  res.render('urls_index', templateVars);
});

//create new URL
app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});

//go to long URL
app.get("/u/:id", (req, res) => {
  const key = req.params.id;
  const longURL = urlDatabase[key];
  if (longURL !== undefined) {
    res.redirect(longURL);
  }
});

//go to create page
app.get("/urls/new", (req, res) => {
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
  const templateVars = { user: undefined };
  if (req.cookies) {
    const userID = req.cookies["user_id"];
    templateVars.user = users[userID];
  }
  res.render("urls_login", templateVars);
});

//login PLACEHOLDER
app.post("/login", (req, res) => {
  const templateVars = { user: undefined };
  templateVars.user = req.body.email;
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//go to register
app.get("/register", (req, res) => {
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
    res.send("Please enter email and password")
  }
  //email already exists, return error
  if (userLookupByEmail(req.body.email)) {
    res.statusCode = 400;
    res.send("This email already exists.")
  }
  const newID = generateRandomString();
  users[newID] = new User(newID, req.body.email, req.body.password);
  res.cookie('user_id', newID);
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
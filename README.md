# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). This project was completed as part of the Lighthouse Labs Web Development Bootcamp.

## Final Product

!["homepage"](https://github.com/nchau3/tinyapp/blob/master/docs/homepage.png)

User homepage.

!["my URLS"](https://github.com/nchau3/tinyapp/blob/master/docs/myURLs.png)

TinyApp provides secure login for multiple users and saves any shortened URLs to each account. Each entry can be updated with a different URL or deleted.

!["URL stats/edit page"](https://github.com/nchau3/tinyapp/blob/master/docs/analytics.png)

Analytics are displayed for each URL, including the number of unique visitors, recent clicks and total visits.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Go to homepage in browser: "localhost:8080"
- Open active URLs: "localhost:8080/u/\<URL ID here\>
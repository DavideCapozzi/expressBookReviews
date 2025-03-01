const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.find(user => user.username === username) !== undefined;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return !!users.find(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password; 

  if (!username || !password) {
    return res.status(400).json({message: "missing username or password"})
  } 
  else if (!authenticatedUser) {
    return res.status(401).json({message: "incorrect username or password"})
  }
  else {
    const accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const review = req.body.review;
    const isbn = req.params.isbn;

    if (!review) {
        return res.status(400).json({message: "Review missing"});
    } else {
    books[isbn].reviews[username] = review; 
    return res.status(200).json({message: "Review updated successfully"});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        res.status(400).json({message : `No book found with isbn ${isbn}`});
    } else if (!books[isbn].reviews[username]) {
        res
        .status(400)
        .json({message : `${username} has not submitted any review`});
    } else {
        delete books[isbn].reviews[username];
        res.status(200).json({message : "Review deleted successfully"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

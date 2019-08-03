const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

// File for connecting to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodelogin'
});

// Initialize app
const app = express();

// Tell express what packages to use
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Display html to client
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/login.html'));
});

// Handle the details the client enters
app.post('/auth', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    // 
    if (username && password) {
        // Request matching entry from database
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            // 
            if(results.length > 0) {
                req.session.loggedIn = true;
                req.session.username = username;
                res.redirect('/home');
            } else {
                res.send('Incorrect username and/or password');
                // Add write to log and bruteforce protection here later
            }
            res.end();
        })
    } else {
        res.send('Please enter username and password');
        res.end();
    }
});

// Homepage
app.get('/home', function(req, res) {
    if(req.session.loggedIn) {
        res.send('Welcome ' + req.session.username);
    } else {
        res.send('Please login first');
    }
});

// Make app listen
app.listen(3000);
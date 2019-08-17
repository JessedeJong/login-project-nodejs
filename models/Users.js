const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

// Database schema for user
const UserSchema = new Schema({
    email: String,
    hash: String,
    salt: String,
});

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// Validate password
UserSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

// Generate webtoken
UserSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        email: this.email,
        id: this.id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),   
    }, 'secret');
}

// JSON auth
UserSchema.methods.toAuthJSON = function() {
    return {
        _id: this.id,
        email: this.email,
        token: this.generateJWT(),
    };
};

// Add the user schema to mongoose
mongoose.model('Users', UserSchema);

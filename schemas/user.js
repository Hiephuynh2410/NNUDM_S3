var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var jsonwebtoken = require("jsonwebtoken");
const config = require('../configs/config');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    role: {
        type: [String],
        default: ["USER"]
    },
    status: {
        type: Boolean,
        default: true
    },
    email: String,
    resetPasswordToken: String,
    resetPasswordExp: String
}, { timestamps: true })

userSchema.pre('save', function () {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
})
userSchema.methods.genTokenResetPassword = function () {
    let token = crypto.randomBytes(30).toString('hex');
    this.resetPasswordToken = token
    this.resetPasswordExp = Date.now() + 10 * 60 * 1000;
    return token;
}

userSchema.methods.getJWT = function () {
    var token = jsonwebtoken.sign({ id: this._id },
        config.SECRET_KEY, {
        expiresIn: config.EXPIRE_JWT
    });
    return token;
}

userSchema.statics.GetCre = async function (username, password) {
    if (!username || !password) {
        return { error: "phai dien day du username va password" };
    }
    var user = await this.findOne({ username: username });
    if (!user) {
        return { error: "user hoac password sai" };
    }
    if (bcrypt.compareSync(password, user.password)) {
        return user;
    } else {
        return { error: "user hoac password sai" };
    }
}

module.exports = new mongoose.model('user', userSchema);
const mongoose              = require("mongoose"),
      Schema                = mongoose.Schema,
      passportLocalMongoose = require("passport-local-mongoose");

// MONGOOSE MODEL CONFIG FOR USER
const UserSchema = new Schema({
      username: {type: String, unique: true, required: true},
      email: {type: String, unique: true, required: true},
      fullname: String,
      role: {type: String, default: 'user'},
      password: String,
      created: {type: Date, default: Date.now}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
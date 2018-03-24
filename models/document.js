const mongoose         = require("mongoose"),
      Schema           = mongoose.Schema;

// MONGOOSE MODEL CONFIG FOR LETTER NUMBER GENERATOR
const documentSchema = new Schema({
      fieldname: String,
      originalname: String,
      encoding: String,
      mimeptype: String,
      destination: String,
      filename: String,
      path: String,
      size: Number,
      created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Document", documentSchema);
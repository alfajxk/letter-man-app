const mongoose         = require("mongoose"),
      Schema           = mongoose.Schema;

// MONGOOSE MODEL CONFIG FOR LETTER NUMBER GENERATOR
const inmemoSchema = new Schema({
      ltrNmbr: String,
      sender: String,
      recipient: String,
      subject: String,
      date: String,
      remark: String,
      status: String,
			confidential: String,
			archive: String,
			user: String,
			editor: String,
      documents: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document"
        }
      ],
      created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Inmemo", inmemoSchema);
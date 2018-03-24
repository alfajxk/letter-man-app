const mongoose         = require("mongoose"),
      Schema           = mongoose.Schema;

// MONGOOSE MODEL CONFIG FOR LETTER NUMBER GENERATOR
const noteSchema = new Schema({
      counter: Number,
      prefix: String,
      ltrNmbr: String,
      debtor: String,
      outstanding: String,
			exposure: String,
			type: String,
      foureyes: String,
      segment: String,
      level: String,
      date: String,
      proposer: String,
      area: String,
      remark: String,
      status: String,
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

module.exports = mongoose.model("Note", noteSchema);
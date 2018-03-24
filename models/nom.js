const mongoose         = require("mongoose"),
      Schema           = mongoose.Schema;

// MONGOOSE MODEL CONFIG FOR LETTER NUMBER GENERATOR
const nomSchema = new Schema({
      counter: Number,
      prefix: String,
      ltrNmbr: String,
	    date: String,
      debtor: String,
			proposer: String,
			segment: String,
      outstanding: String,
			exposure: String,
			type: String,
			level: String,
     	author1: String,
      author2: String,
      place: String,
      noteNmbr: String,
      noteDate: String,
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

module.exports = mongoose.model("Nom",nomSchema);
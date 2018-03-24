const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Letter  = require("../models/letter"),
      Document  = require("../models/document");



// INDEX PAGE ALL LETTERS ROUTE
router.get('/letters', isLoggedIn, function(req, res){
  Letter.find({}, function (err, allLetters){
    if(err){
      console.log(err);
    } else {
      res.render("letters/index", {letters:allLetters});
    }
  });
});

//  SHOW FORM TO GENERATE LETTER NUMBER
router.get("/letters/new", isLoggedIn, function(req, res){
  // Find last prefix from DB
    Letter.findOne({}, {_id: 0, 'prefix': 1}).sort({created: -1}).exec(function last(err, lastId){
    // Check if prefix null or not
    if(lastId == null){
    res.render("letters/new"); 
  } else if(parseInt(prefix) > parseInt(lastId.prefix)){
         res.render("letters/new"); 
    } else {
      // Find last counter from DB
      Letter.findOne({}, {_id: 0, 'counter': 1}).sort({created: -1}).exec(function last(err, lastId){
        res.render("letters/new", {lastId: lastId.counter+1});
      });   
    }
  });
});

// CREATE LETTER NUMBER ROUTE
router.post("/letters", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/letters/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.letter.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.letter.ltrNmbr;
      let newName = name.replace(/\//g, "-");
      next(null, newDateFile + '-' + newName +'-'+Date.now()+'.'+ext);
    }
  }),
  fileFilter: function(req, file, next) {
    if(!file){
      next();
    }
    if (file.mimetype == 'application/pdf') 
    {
        next(null, true);
    } else {
        next("File type not supported", false);
    }
  }
}).array('docs', 3), function(req, res){  
  // Get data from form
  var formData = req.body.letter;
  // Create new letter number and save to DB
  Letter.create(formData, function(err, newLetter){
    if(err) {
      res.render("letters/new");
    } else {
  //then redirect to the list page
  //create doc and push to letter
 let docs = req.files.map((file) => {
  return {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    destination:file.destination,
    filename: file.filename,
    path: file.path,
    size: file.size
    }
  }); 
  Document.create(docs, (err, document) => {
    if (err) return console.log(err)
      if (document  == null || document == undefined){
        res.redirect('/letters');
      } else if (document.length == 1){
        newLetter.documents.push(document[0]['_id']);
        newLetter.save();
        res.redirect('/letters');  
      } else if (document.length == 2) {
        newLetter.documents.push(document[0]['_id']);
        newLetter.documents.push(document[1]['_id']);
        newLetter.save();
        res.redirect('/letters');
      } else {
        newLetter.documents.push(document[0]['_id']);
        newLetter.documents.push(document[1]['_id']);
        newLetter.documents.push(document[2]['_id']);
        newLetter.save();
        res.redirect('/letters');
      }
    });
  }
  });
});

//SHOW ROUTE to show more info one letter
router.get("/letters/:id", isLoggedIn, function(req, res){
  // Find the letter id
  Letter.findById(req.params.id).populate('documents').exec(function(err, letter){
		let sender = letter.sender
    if(err || letter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
      res.redirect("/letters");
    } else {
      res.render("letters/show", {letter: letter});
	}
  });
});

// EDIT ROUTE
router.get("/letters/:id/edit", isLoggedIn, function(req, res){
  Letter.findById(req.params.id).populate('documents').exec(function(err, letter){
    let sender = letter.sender
    if(err || letter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
      res.redirect("/letters");
    } else {
      res.render("letters/edit", {letter: letter});
    }
  });
});

// UPDATE ROUTE
router.put("/letters/:id", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/letters/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.letter.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.letter.ltrNmbr;
      let newName = name.replace(/\//g, "-");
      next(null, newDateFile + '-' + newName +'-'+Date.now()+'.'+ext);
    }
  }),
  fileFilter: function(req, file, next) {
    if(!file){
      next();
    }
    if (file.mimetype == 'application/pdf') 
    {
        next(null, true);
    } else {
        next("File type not supported", false);
    }
  }
}).array('docs', 3), function(req, res){
  req.body.letter.body = req.sanitize(req.body.letter.body);
  Letter.findByIdAndUpdate(req.params.id, req.body.letter, function(err, letter){
    let sender = letter.sender
    if(err || letter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
      console.log(err);
      res.redirect("/letters");
    } else {
      let docs = req.files.map((file) => {
  return {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    destination:file.destination,
    filename: file.filename,
    path: file.path,
    size: file.size
    }
  }); 
  Document.create(docs, (err, document) => {
    if (err) return console.log(err)
      if (document  == null || document == undefined){
        res.redirect("/letters/" + letter._id);
      } else if (document.length == 1){
        letter.documents.push(document[0]['_id']);
        letter.save();
        res.redirect("/letters/" + letter._id);  
      } else if (document.length == 2) {
        letter.documents.push(document[0]['_id']);
        letter.documents.push(document[1]['_id']);
        letter.save();
        res.redirect("/letters/" + letter._id);
      } else {
        letter.documents.push(document[0]['_id']);
        letter.documents.push(document[1]['_id']);
        letter.documents.push(document[2]['_id']);
        letter.save();
        res.redirect("/letters/" + letter._id);
      }
    });
  }
  });
});

// DELETE ROUTE
router.delete("/letters/:id", isLoggedIn,	function(req, res){
  // Destroy number of letter
  Letter.findByIdAndRemove(req.params.id).populate('documents').exec(function(err, letter){
		letter.documents.forEach(function(document){
      let filePath =  "public/uploads/letters/"+document.filename;
      fs.unlinkSync(filePath);
    }); 
	Document.remove({ _id: { $in: letter.documents } }, function(err, document) {
    let sender = letter.sender
    if(err || letter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
      res.redirect("/letters");
    } else {
      res.redirect("/letters");
    }
  });
});		
});

// Middleware Login/Logout Route
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}; 

module.exports = router;
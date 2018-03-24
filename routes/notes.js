const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Note    = require("../models/note"),
      Document  = require("../models/document");    

// INDEX PAGE ALL NOTES ROUTE
router.get('/notes', isLoggedIn, function(req, res){
  Note.find({}, function (err, allNotes){
    if(err){
      console.log(err);
    } else {
      res.render("notes/index", {notes:allNotes});
    }
  });
});

//  SHOW FORM TO GENERATE NOTE NUMBER
router.get("/notes/new", isLoggedIn, function(req, res){
  // Find last prefix from DB
    Note.findOne({}, {_id: 0, 'prefix': 1}).sort({created: -1}).exec(function last(err, lastId){
    // Check if prefix null or not
    if(lastId == null){
    res.render("notes/new"); 
  } else if(parseInt(prefix) > parseInt(lastId.prefix)){
         res.render("notes/new"); 
    } else {
      // Find last counter from DB
      Note.findOne({}, {_id: 0, 'counter': 1}).sort({created: -1}).exec(function last(err, lastId){
        res.render("notes/new", {lastId: lastId.counter+1});
      });   
    }
  });
});


// CREATE NOTE NUMBER ROUTE
router.post("/notes", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/notes/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.note.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.note.ltrNmbr;
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
  var formData = req.body.note;
  // Create new note number and save to DB
  Note.create(formData, function(err, newNote){
    if(err) {
      res.render("notes/new");
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
        res.redirect('/notes');
      } else if (document.length == 1){
        newNote.documents.push(document[0]['_id']);
        newNote.save();
        res.redirect('/notes');  
      } else if (document.length == 2) {
        newNote.documents.push(document[0]['_id']);
        newNote.documents.push(document[1]['_id']);
        newNote.save();
        res.redirect('/notes');
      } else {
        newNote.documents.push(document[0]['_id']);
        newNote.documents.push(document[1]['_id']);
        newNote.documents.push(document[2]['_id']);
        newNote.save();
        res.redirect('/notes');
      }
    });
  }
  });
});

//SHOW ROUTE to show more info one note
router.get("/notes/:id", isLoggedIn, function(req, res){
  // Find the note id
  Note.findById(req.params.id).populate('documents').exec(function(err, note){
    let user = note.user
    if(err) {
      res.redirect("/notes");
    } else {
      res.render("notes/show", {note: note});
    }
  });
});

// EDIT ROUTE
router.get("/notes/:id/edit", isLoggedIn, function(req, res){
  Note.findById(req.params.id).populate('documents').exec(function(err, note){
    let user = note.user
    if(err) {
      res.redirect("/notes");
    } else {
      res.render("notes/edit", {note: note});
    }
  });
});

// UPDATE ROUTE
router.put("/notes/:id", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/notes/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.note.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.note.ltrNmbr;
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
	req.body.note.body = req.sanitize(req.body.note.body);
  Note.findByIdAndUpdate(req.params.id, req.body.note, function(err, note){
    let user = note.user
    if(err) {
			console.log(err);
      res.redirect("/notes");
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
        res.redirect("/notes/" + note._id);
      } else if (document.length == 1){
        note.documents.push(document[0]['_id']);
        note.save();
        res.redirect("/notes/" + note._id);  
      } else if (document.length == 2) {
        note.documents.push(document[0]['_id']);
        note.documents.push(document[1]['_id']);
        note.save();
        res.redirect("/notes/" + note._id);
      } else {
        note.documents.push(document[0]['_id']);
        note.documents.push(document[1]['_id']);
        note.documents.push(document[2]['_id']);
        note.save();
        res.redirect("/notes/" + note._id);
      }
    });
  }
  });
});

// DELETE ROUTE
router.delete("/notes/:id", isLoggedIn, function(req, res){
  // Destroy number of note
  Note.findByIdAndRemove(req.params.id).populate('documents').exec(function(err, note){
		note.documents.forEach(function(document){
      let filePath =  "public/uploads/notes/"+document.filename;
      fs.unlinkSync(filePath);
    }); 
	Document.remove({ _id: { $in: note.documents } }, function(err, document) {
    let user = note.user
    if(err) {
      res.redirect("/notes");
    } else {
      res.redirect("/notes");
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
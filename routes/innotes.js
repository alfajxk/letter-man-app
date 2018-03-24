const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Innote    = require("../models/innote"),
      Document  = require("../models/document");    

// INDEX PAGE ALL NOTES ROUTE
router.get('/innotes', isLoggedIn, function(req, res){
  Innote.find({}, function (err, allInnotes){
    if(err){
      console.log(err);
    } else {
      res.render("innotes/index", {innotes:allInnotes});
    }
  });
});

//  SHOW FORM TO GENERATE NOTE NUMBER
router.get("/innotes/new", isLoggedIn, function(req, res){
   res.render("innotes/new");
});


// CREATE NOTE NUMBER ROUTE
router.post("/innotes", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/innotes/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.innote.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.innote.ltrNmbr;
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
  var formData = req.body.innote;
  // Create new note number and save to DB
  Innote.create(formData, function(err, newInnote){
    if(err) {
      res.render("innotes/new");
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
        res.redirect('/innotes');
      } else if (document.length == 1){
        newInnote.documents.push(document[0]['_id']);
        newInnote.save();
        res.redirect('/innotes');  
      } else if (document.length == 2) {
        newInnote.documents.push(document[0]['_id']);
        newInnote.documents.push(document[1]['_id']);
        newInnote.save();
        res.redirect('/innotes');
      } else {
        newInnote.documents.push(document[0]['_id']);
        newInnote.documents.push(document[1]['_id']);
        newInnote.documents.push(document[2]['_id']);
        newInnote.save();
        res.redirect('/innotes');
      }
    });
  }
  });
});


//SHOW ROUTE to show more info one note
router.get("/innotes/:id", isLoggedIn, function(req, res){
  // Find the note id
  Innote.findById(req.params.id).populate('documents').exec(function(err, innote){
    let user = innote.user
    if(err) {
      res.redirect("/innotes");
    } else {
      res.render("innotes/show", {innote: innote});
    }
  });
});

// EDIT ROUTE
router.get("/innotes/:id/edit", isLoggedIn, function(req, res){
  Innote.findById(req.params.id).populate('documents').exec(function(err, innote){
    let user = innote.user
    if(err) {
      res.redirect("/innotes");
    } else {
      res.render("innotes/edit", {innote: innote});
    }
  });
});

// UPDATE ROUTE
router.put("/innotes/:id", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/innotes/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.innote.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.innote.ltrNmbr;
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
	req.body.innote.body = req.sanitize(req.body.innote.body);
  Innote.findByIdAndUpdate(req.params.id, req.body.innote, function(err, innote){
    let user = innote.user
    if(err) {
			console.log(err);
      res.redirect("/innotes");
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
        res.redirect("/innotes/" + innote._id);
      } else if (document.length == 1){
        innote.documents.push(document[0]['_id']);
        innote.save();
        res.redirect("/innotes/" + innote._id);  
      } else if (document.length == 2) {
        innote.documents.push(document[0]['_id']);
        innote.documents.push(document[1]['_id']);
        innote.save();
        res.redirect("/innotes/" + innote._id);
      } else {
        innote.documents.push(document[0]['_id']);
        innote.documents.push(document[1]['_id']);
        innote.documents.push(document[2]['_id']);
        innote.save();
        res.redirect("/innotes/" + innote._id);
      }
    });
  }
  });
});

// DELETE ROUTE
router.delete("/innotes/:id", isLoggedIn, function(req, res){
  // Destroy number of note
  Innote.findByIdAndRemove(req.params.id).populate('documents').exec(function(err, innote){
		innote.documents.forEach(function(document){
      let filePath =  "public/uploads/innotes/"+document.filename;
      fs.unlinkSync(filePath);
    }); 
	Document.remove({ _id: { $in: innote.documents } }, function(err, document) {
    let user = innote.user
    if(err) {
      res.redirect("/innotes");
    } else {
      res.redirect("/innotes");
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
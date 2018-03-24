const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Inletter  = require("../models/inletter"),
      Document  = require("../models/document");

// INDEX PAGE ALL LETTERS ROUTE
router.get('/inletters', isLoggedIn, function(req, res){
  Inletter.find({}, function (err, allInletters){
    if(err){
      console.log(err);
    } else {
      res.render("inletters/index", {inletters:allInletters});
    }
  });
});

//  SHOW FORM TO STORE LETTER NUMBER
router.get("/inletters/new", isLoggedIn, function(req, res){
  // Find last prefix from DB
    res.render("inletters/new");
});

// CREATE LETTER STORE ROUTE
router.post("/inletters", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/inletters/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.inletter.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.inletter.ltrNmbr;
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
  var formData = req.body.inletter;
  // Create new letter number and save to DB
  Inletter.create(formData, function(err, newInletter){
    if(err) {
      res.render("inletters/new");
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
        res.redirect('/inletters');
      } else if (document.length == 1){
        newInletter.documents.push(document[0]['_id']);
        newInletter.save();
        res.redirect('/inletters');  
      } else if (document.length == 2) {
        newInletter.documents.push(document[0]['_id']);
        newInletter.documents.push(document[1]['_id']);
        newInletter.save();
        res.redirect('/inletters');
      } else {
        newInletter.documents.push(document[0]['_id']);
        newInletter.documents.push(document[1]['_id']);
        newInletter.documents.push(document[2]['_id']);
        newInletter.save();
        res.redirect('/inletters');
      }
    });
  }
  });
});

//SHOW ROUTE to show more info one letter
router.get("/inletters/:id", isLoggedIn, function(req, res){
  // Find the letter id
  Inletter.findById(req.params.id).populate('documents').exec(function(err, inletter){
    let user = inletter.user
    if(err || inletter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
      res.redirect("/inletters");
    } else {
      res.render("inletters/show", {inletter: inletter});
    }
  });
});

// EDIT ROUTE
router.get("/inletters/:id/edit", isLoggedIn, function(req, res){
  Inletter.findById(req.params.id).populate('documents').exec(function(err, inletter){
    let user = inletter.user
    if(err || inletter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
      res.redirect("/inletters");
    } else {
      res.render("inletters/edit", {inletter: inletter});
    }
  });
});

// UPDATE ROUTE
router.put("/inletters/:id", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/inletters/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.inletter.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.inletter.ltrNmbr;
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
  req.body.inletter.body = req.sanitize(req.body.inletter.body);
  Inletter.findByIdAndUpdate(req.params.id, req.body.inletter, function(err, inletter){
    let user = inletter.user
    if(err || inletter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
      console.log(err);
      res.redirect("/inletters");
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
        res.redirect("/inletters/" + inletter._id);
      } else if (document.length == 1){
        inletter.documents.push(document[0]['_id']);
        inletter.save();
        res.redirect("/inletters/" + inletter._id);  
      } else if (document.length == 2) {
        inletter.documents.push(document[0]['_id']);
        inletter.documents.push(document[1]['_id']);
        inletter.save();
        res.redirect("/inletters/" + inletter._id);
      } else {
        inletter.documents.push(document[0]['_id']);
        inletter.documents.push(document[1]['_id']);
        inletter.documents.push(document[2]['_id']);
        inletter.save();
        res.redirect("/inletters/" + inletter._id);
      }
    });
  }
  });
});

// DELETE ROUTE
router.delete("/inletters/:id", isLoggedIn, function(req, res){
  // Destroy number of letter
  Inletter.findByIdAndRemove(req.params.id).populate('documents').exec(function(err, inletter){
    inletter.documents.forEach(function(document){
      let filePath =  "public/uploads/inletters/"+document.filename;
      fs.unlinkSync(filePath);
    }); 
	Document.remove({ _id: { $in: inletter.documents } }, function(err, document) {
    let user = inletter.user;
    if(err || inletter.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
      res.redirect("/inletters");
    } else {
      res.redirect("/inletters");
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
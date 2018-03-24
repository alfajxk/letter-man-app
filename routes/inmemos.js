const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Inmemo  = require("../models/inmemo"),
      Document  = require("../models/document");

// INDEX PAGE ALL MEMOS ROUTE
router.get('/inmemos', isLoggedIn, function(req, res){
  Inmemo.find({}, function (err, allInmemos){
    if(err){
      console.log(err);
    } else {
      res.render("inmemos/index", {inmemos:allInmemos});
    }
  });
});

//  SHOW FORM TO STORE MEMO NUMBER
router.get("/inmemos/new", isLoggedIn, function(req, res){
  // Find last prefix from DB
   res.render("inmemos/new");
});


// CREATE MEMO STORE ROUTE
router.post("/inmemos", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/inmemos/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.inmemo.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.inmemo.ltrNmbr;
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
  var formData = req.body.inmemo;
  // Create new memo number and save to DB
  Inmemo.create(formData, function(err, newInmemo){
    if(err) {
      res.render("inmemos/new");
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
        res.redirect('/inmemos');
      } else if (document.length == 1){
        newInmemo.documents.push(document[0]['_id']);
        newInmemo.save();
        res.redirect('/inmemos');  
      } else if (document.length == 2) {
        newInmemo.documents.push(document[0]['_id']);
        newInmemo.documents.push(document[1]['_id']);
        newInmemo.save();
        res.redirect('/inmemos');
      } else {
        newInmemo.documents.push(document[0]['_id']);
        newInmemo.documents.push(document[1]['_id']);
        newInmemo.documents.push(document[2]['_id']);
        newInmemo.save();
        res.redirect('/inmemos');
      }
    });
  }
  });
});

//SHOW ROUTE to show more info one memo
router.get("/inmemos/:id", isLoggedIn, function(req, res){
  // Find the memo id
  Inmemo.findById(req.params.id).populate('documents').exec(function(err, inmemo){
    let user = inmemo.user
    if(err || inmemo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
      res.redirect("/inmemos");
    } else {
      res.render("inmemos/show", {inmemo: inmemo});
    }
  });
});

// EDIT ROUTE
router.get("/inmemos/:id/edit", isLoggedIn, function(req, res){
  Inmemo.findById(req.params.id).populate('documents').exec(function(err, inmemo){
    let user = inmemo.user
    if(err || inmemo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
      res.redirect("/inmemos");
    } else {
      res.render("inmemos/edit", {inmemo: inmemo});
    }
  });
});

// UPDATE ROUTE
router.put("/inmemos/:id", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/inmemos/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.inmemo.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.inmemo.ltrNmbr;
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
	req.body.inmemo.body = req.sanitize(req.body.inmemo.body);
  Inmemo.findByIdAndUpdate(req.params.id, req.body.inmemo, function(err, inmemo){
    let user = inmemo.user
    if(err || inmemo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
			console.log(err);
      res.redirect("/inmemos");
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
        res.redirect("/inmemos/" + inmemo._id);
      } else if (document.length == 1){
        inmemo.documents.push(document[0]['_id']);
        inmemo.save();
        res.redirect("/inmemos/" + inmemo._id);  
      } else if (document.length == 2) {
        inmemo.documents.push(document[0]['_id']);
        inmemo.documents.push(document[1]['_id']);
        inmemo.save();
        res.redirect("/inmemos/" + inmemo._id);
      } else {
        inmemo.documents.push(document[0]['_id']);
        inmemo.documents.push(document[1]['_id']);
        inmemo.documents.push(document[2]['_id']);
        inmemo.save();
        res.redirect("/inmemos/" + inmemo._id);
      }
    });
  }
  });
});

// DELETE ROUTE
router.delete("/inmemos/:id", isLoggedIn, function(req, res){
  // Destroy number of memo
  Inmemo.findByIdAndRemove(req.params.id).populate('documents').exec(function(err, inmemo){
		inmemo.documents.forEach(function(document){
      let filePath =  "public/uploads/inmemos/"+document.filename;
      fs.unlinkSync(filePath);
    }); 
	Document.remove({ _id: { $in: inmemo.documents } }, function(err, document) {
    let user = inmemo.user
    if(err || inmemo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == user.toLowerCase())) {
      res.redirect("/inmemos");
    } else {
      res.redirect("/inmemos");
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
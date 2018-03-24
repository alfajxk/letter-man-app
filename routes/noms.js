const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Nom     = require("../models/nom"),
      Document  = require("../models/document"); 


// INDEX PAGE ALL NOM ROUTE
router.get('/noms', isLoggedIn, function(req, res){
  Nom.find({}, function (err, allNoms){
    if(err){
      console.log(err);
    } else {
      res.render("noms/index", {noms:allNoms});
    }
  });
});

//  SHOW FORM TO GENERATE NOM NUMBER
router.get("/noms/new", isLoggedIn, function(req, res){
  // Find last prefix from DB
    Nom.findOne({}, {_id: 0, 'prefix': 1}).sort({created: -1}).exec(function last(err, lastId){
    // Check if prefix null or not
    if(lastId == null){
    res.render("noms/new"); 
  } else if(parseInt(prefix) > parseInt(lastId.prefix)){
         res.render("noms/new"); 
    } else {
      // Find last counter from DB
      Nom.findOne({}, {_id: 0, 'counter': 1}).sort({created: -1}).exec(function last(err, lastId){
        res.render("noms/new", {lastId: lastId.counter+1});
      });   
    }
  });
});


// CREATE NOM NUMBER ROUTE
router.post("/noms", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/noms/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.nom.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.nom.ltrNmbr;
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
  var formData = req.body.nom;
  // Create new nom number and save to DB
  Nom.create(formData, function(err, newNom){
    if(err) {
      res.render("noms/new");
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
        res.redirect('/noms');
      } else if (document.length == 1){
        newNom.documents.push(document[0]['_id']);
        newNom.save();
        res.redirect('/noms');  
      } else if (document.length == 2) {
        newNom.documents.push(document[0]['_id']);
        newNom.documents.push(document[1]['_id']);
        newNom.save();
        res.redirect('/noms');
      } else {
        newNom.documents.push(document[0]['_id']);
        newNom.documents.push(document[1]['_id']);
        newNom.documents.push(document[2]['_id']);
        newNom.save();
        res.redirect('/noms');
      }
    });
  }
  });
});


//SHOW ROUTE to show more info one nom
router.get("/noms/:id", isLoggedIn, function(req, res){
  // Find the nom id
  Nom.findById(req.params.id).populate('documents').exec(function(err, nom){
    let user = nom.user
    if(err) {
      res.redirect("/noms");
    } else {
      res.render("noms/show", {nom: nom});
    }
  });
});

// EDIT ROUTE
router.get("/noms/:id/edit", isLoggedIn, function(req, res){
  Nom.findById(req.params.id).populate('documents').exec(function(err, nom){
    let user = nom.user
    if(err) {
      res.redirect("/noms");
    } else {
      res.render("noms/edit", {nom: nom});
    }
  });
});

// UPDATE ROUTE
router.put("/noms/:id", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/noms/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.nom.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.nom.ltrNmbr;
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
	req.body.nom.body = req.sanitize(req.body.nom.body);
  Nom.findByIdAndUpdate(req.params.id, req.body.nom, function(err, nom){
    let user = nom.user
    if(err) {
			console.log(err);
      res.redirect("/noms");
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
        res.redirect("/noms/" + nom._id);
      } else if (document.length == 1){
        nom.documents.push(document[0]['_id']);
        nom.save();
        res.redirect("/noms/" + nom._id);  
      } else if (document.length == 2) {
        nom.documents.push(document[0]['_id']);
        nom.documents.push(document[1]['_id']);
        nom.save();
        res.redirect("/noms/" + nom._id);
      } else {
        nom.documents.push(document[0]['_id']);
        nom.documents.push(document[1]['_id']);
        nom.documents.push(document[2]['_id']);
        nom.save();
        res.redirect("/noms/" + nom._id);
      }
    });
  }
  });
});

// DELETE ROUTE
router.delete("/noms/:id", isLoggedIn, function(req, res){
  // Destroy number of nom
  Nom.findByIdAndRemove(req.params.id).populate('documents').exec(function(err, nom){
		nom.documents.forEach(function(document){
      let filePath =  "public/uploads/noms/"+document.filename;
      fs.unlinkSync(filePath);
    }); 
	Document.remove({ _id: { $in: nom.documents } }, function(err, document) {
    let user = nom.user
    if(err) {
      res.redirect("/noms");
    } else {
      res.redirect("/noms");
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
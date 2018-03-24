const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Memo  = require("../models/memo"),
      Document  = require("../models/document");

// INDEX PAGE ALL MEMOS ROUTE
router.get('/memos', isLoggedIn, function(req, res){
  Memo.find({}, function (err, allMemos){
    if(err){
      console.log(err);
    } else {
      res.render("memos/index", {memos:allMemos});
    }
  });
});

//  SHOW FORM TO GENERATE MEMO NUMBER
router.get("/memos/new", isLoggedIn, function(req, res){
  // Find last prefix from DB
    Memo.findOne({}, {_id: 0, 'prefix': 1}).sort({created: -1}).exec(function last(err, lastId){
    // Check if prefix null or not
    if(lastId == null){
    res.render("memos/new"); 
  } else if(parseInt(prefix) > parseInt(lastId.prefix)){
         res.render("memos/new"); 
    } else {
      // Find last counter from DB
      Memo.findOne({}, {_id: 0, 'counter': 1}).sort({created: -1}).exec(function last(err, lastId){
        res.render("memos/new", {lastId: lastId.counter+1});
      });   
    }
  });
});


// CREATE MEMO NUMBER ROUTE
router.post("/memos", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/memos/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.memo.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.memo.ltrNmbr;
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
  var formData = req.body.memo;
  // Create new memo number and save to DB
  Memo.create(formData, function(err, newMemo){
    if(err) {
      res.render("memos/new");
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
        res.redirect('/memos');
      } else if (document.length == 1){
        newMemo.documents.push(document[0]['_id']);
        newMemo.save();
        res.redirect('/memos');  
      } else if (document.length == 2) {
        newMemo.documents.push(document[0]['_id']);
        newMemo.documents.push(document[1]['_id']);
        newMemo.save();
        res.redirect('/memos');
      } else {
        newMemo.documents.push(document[0]['_id']);
        newMemo.documents.push(document[1]['_id']);
        newMemo.documents.push(document[2]['_id']);
        newMemo.save();
        res.redirect('/memos');
      }
    });
  }
  });
});

//SHOW ROUTE to show more info one memo
router.get("/memos/:id", isLoggedIn, function(req, res){
  // Find the memo id
  Memo.findById(req.params.id).populate('documents').exec(function(err, memo){
    let sender = memo.sender
    if(err || memo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
      res.redirect("/memos");
    } else {
      res.render("memos/show", {memo: memo});
    }
  });
});

// EDIT ROUTE
router.get("/memos/:id/edit", isLoggedIn, function(req, res){
  Memo.findById(req.params.id).populate('documents').exec(function(err, memo){
    let sender = memo.sender
    if(err || memo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
      res.redirect("/memos");
    } else {
      res.render("memos/edit", {memo: memo});
    }
  });
});

// UPDATE ROUTE
router.put("/memos/:id", isLoggedIn, multer({
  storage: multer.diskStorage({
    destination: function(req, file, next){
      next(null,'public/uploads/memos/');
    },
    filename: function(req, file, next){
      const ext = file.mimetype.split('/')[1];
      let dateFile = req.body.memo.date;
      let newDateFile = dateFile.replace(/-/g, '');
      let name = req.body.memo.ltrNmbr;
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
	req.body.memo.body = req.sanitize(req.body.memo.body);
  Memo.findByIdAndUpdate(req.params.id, req.body.memo, function(err, memo){
    let sender = memo.sender
    if(err || memo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
			console.log(err);
      res.redirect("/memos");
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
        res.redirect("/memos/" + memo._id);
      } else if (document.length == 1){
        memo.documents.push(document[0]['_id']);
        memo.save();
        res.redirect("/memos/" + memo._id);  
      } else if (document.length == 2) {
        memo.documents.push(document[0]['_id']);
        memo.documents.push(document[1]['_id']);
        memo.save();
        res.redirect("/memos/" + memo._id);
      } else {
        memo.documents.push(document[0]['_id']);
        memo.documents.push(document[1]['_id']);
        memo.documents.push(document[2]['_id']);
        memo.save();
        res.redirect("/memos/" + memo._id);
      }
    });
  }
  });
});

// DELETE ROUTE
router.delete("/memos/:id", isLoggedIn, function(req, res){
  // Destroy number of memo
  Memo.findByIdAndRemove(req.params.id).populate('documents').exec(function(err, memo){
		memo.documents.forEach(function(document){
      let filePath =  "public/uploads/memos/"+document.filename;
      fs.unlinkSync(filePath);
    }); 
	Document.remove({ _id: { $in: memo.documents } }, function(err, document) {
    let sender = memo.sender
    if(err || memo.confidential == "Yes" && !(req.user.role == 'admin' || req.user.fullname.toLowerCase() == sender.toLowerCase())) {
      res.redirect("/memos");
    } else {
      res.redirect("/memos");
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
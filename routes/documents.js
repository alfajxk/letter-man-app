const express = require("express"),
      router  = express.Router(),
      fs      = require('fs'),
      multer  = require('multer'),
      Letter		= require("../models/letter"),
			Memo			= require("../models/memo"),
			Nom				= require("../models/nom"),
			Inmemo  	= require("../models/inmemo"),
			Inletter  = require("../models/inletter"),
			Note  		= require("../models/note"),
			Innote  	= require("../models/innote"),
      Document  = require("../models/document");

// PDF VIEW IN BROWSER
router.get('/letters/:id/documents/:documentId', function (req, res) {
    Document.findById(req.params.documentId, function(err, document){
    let filePath =  "public/uploads/letters/"+document.filename;
    fs.readFile(filePath, function (err, data){
        res.contentType("application/pdf");
        res.send(data);
    });
  });  
});

router.get('/memos/:id/documents/:documentId', function (req, res) {
    Document.findById(req.params.documentId, function(err, document){
    let filePath =  "public/uploads/memos/"+document.filename;
    fs.readFile(filePath, function (err, data){
        res.contentType("application/pdf");
        res.send(data);
    });
  });  
});

router.get('/noms/:id/documents/:documentId', function (req, res) {
    Document.findById(req.params.documentId, function(err, document){
    let filePath =  "public/uploads/noms/"+document.filename;
    fs.readFile(filePath, function (err, data){
        res.contentType("application/pdf");
        res.send(data);
    });
  });  
});

router.get('/innotes/:id/documents/:documentId', function (req, res) {
    Document.findById(req.params.documentId, function(err, document){
    let filePath =  "public/uploads/innotes/"+document.filename;
    fs.readFile(filePath, function (err, data){
        res.contentType("application/pdf");
        res.send(data);
    });
  });  
});

router.get('/inletters/:id/documents/:documentId', function (req, res) {
    Document.findById(req.params.documentId, function(err, document){
    let filePath =  "public/uploads/inletters/"+document.filename;
    fs.readFile(filePath, function (err, data){
        res.contentType("application/pdf");
        res.send(data);
    });
  });  
});

router.get('/inmemos/:id/documents/:documentId', function (req, res) {
    Document.findById(req.params.documentId, function(err, document){
    let filePath =  "public/uploads/inmemos/"+document.filename;
    fs.readFile(filePath, function (err, data){
        res.contentType("application/pdf");
        res.send(data);
    });
  });  
});

router.get('/notes/:id/documents/:documentId', function (req, res) {
    Document.findById(req.params.documentId, function(err, document){
    let filePath =  "public/uploads/notes/"+document.filename;
    fs.readFile(filePath, function (err, data){
        res.contentType("application/pdf");
        res.send(data);
    });
  });  
});

//DELETE ONE PDF
router.delete("/letters/:id/documents/:documentId", function(req, res){
    Document.findByIdAndRemove(req.params.documentId, function(err, document){
    Letter.update({}, {$pull: {documents: req.params.documentId}},  { multi: true }, function(err){
			let filePath =  "public/uploads/letters/"+document.filename;
        if(err){
            console.log("PROBLEM!");
        } else {
						fs.unlinkSync(filePath);
            res.redirect("/letters/" + req.params.id);
					
        }
    })
});
});

router.delete("/memos/:id/documents/:documentId", function(req, res){
    Document.findByIdAndRemove(req.params.documentId, function(err, document){
		Memo.update({}, {$pull: {documents: req.params.documentId}},  { multi: true }, function(err){
			let filePath =  "public/uploads/memos/"+document.filename;
        if(err){
            console.log("PROBLEM!");
        } else {
						fs.unlinkSync(filePath);
            res.redirect("/memos/" + req.params.id);
        }
    })
});			
});

router.delete("/noms/:id/documents/:documentId", function(req, res){
    Document.findByIdAndRemove(req.params.documentId, function(err, document){
		Nom.update({}, {$pull: {documents: req.params.documentId}},  { multi: true }, function(err){
			let filePath =  "public/uploads/noms/"+document.filename;
        if(err){
            console.log("PROBLEM!");
        } else {
						fs.unlinkSync(filePath);
            res.redirect("/noms/" + req.params.id);
        }
    })
});			
});

router.delete("/innotes/:id/documents/:documentId", function(req, res){
    Document.findByIdAndRemove(req.params.documentId, function(err, document){
		Innote.update({}, {$pull: {documents: req.params.documentId}},  { multi: true }, function(err){
			let filePath =  "public/uploads/innotes/"+document.filename;
        if(err){
            console.log("PROBLEM!");
        } else {
						fs.unlinkSync(filePath);
            res.redirect("/innotes/" + req.params.id);
        }
    })
});			
});

router.delete("/inletters/:id/documents/:documentId", function(req, res){
    Document.findByIdAndRemove(req.params.documentId, function(err, document){
		Inletter.update({}, {$pull: {documents: req.params.documentId}},  { multi: true }, function(err){
			let filePath =  "public/uploads/inletters/"+document.filename;
        if(err){
            console.log("PROBLEM!");
        } else {
						fs.unlinkSync(filePath);
            res.redirect("/inletters/" + req.params.id);
        }
    })
});			
});

router.delete("/inmemos/:id/documents/:documentId", function(req, res){
    Document.findByIdAndRemove(req.params.documentId, function(err, document){
		Inmemo.update({}, {$pull: {documents: req.params.documentId}},  { multi: true }, function(err){
			let filePath =  "public/uploads/inmemos/"+document.filename;
        if(err){
            console.log("PROBLEM!");
        } else {
						fs.unlinkSync(filePath);
            res.redirect("/inmemos/" + req.params.id);
        }
    })
});			
});

router.delete("/notes/:id/documents/:documentId", function(req, res){
    Document.findByIdAndRemove(req.params.documentId, function(err, document){
		Note.update({}, {$pull: {documents: req.params.documentId}},  { multi: true }, function(err){
			let filePath =  "public/uploads/notes/"+document.filename;
        if(err){
            console.log("PROBLEM!");
        } else {
						fs.unlinkSync(filePath);
            res.redirect("/notes/" + req.params.id);
        }
    })
});			
});

module.exports = router;
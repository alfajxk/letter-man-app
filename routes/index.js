const express      = require("express"),
      router       = express.Router(),
      passport     = require("passport"),
      User         = require("../models/user"),
			Letter		   = require("../models/letter"),
			Memo			   = require("../models/memo"),
			Nom				   = require("../models/nom"),
			Inmemo  	   = require("../models/inmemo"),
			Inletter     = require("../models/inletter"),
			Note  		   = require("../models/note"),
			Innote  	   = require("../models/innote"),
      crypto       = require('crypto'),
      async        = require("async");

// FIRST PAGE ROUTE
router.get("/", isLoggedIn, function(req, res){
	Letter.count({}, function(err, countLetters){
	Memo.count({}, function(err, countMemos){	
	Nom.count({}, function(err, countNoms){		
	Inmemo.count({}, function(err, countInmemos){		
	Inletter.count({}, function(err, countInletters){		
	Note.count({}, function(err, countNotes){		
	Innote.count({}, function(err, countInnotes){		
		res.render("index", {letters:countLetters, memos:countMemos, noms:countNoms, inmemos:countInmemos, inletters:countInletters, notes:countNotes, innotes:countInnotes});
	});
	});
	});
	});
	});
	});
	});
});

//AUTH ROUTE
router.get("/register", function(req, res){
  res.render("register");
});

// INDEX PAGE ALL USERS ROUTE
router.get('/users', isLoggedIn, isAdmin, function(req, res, next){
  User.find({}, function (err, allUsers){
    if(err){
      console.log(err);
    } else {
      res.render("users/index", {users:allUsers});
    }
  });
});

//SHOW ROUTE to show more info user
router.get("/users/:id", isLoggedIn, isUserOrAdmin, function(req, res){
  // Find the user id
  User.findById(req.params.id, function(err, user){
    if(err) {
      res.redirect("/users");
    } else {
      res.render("users/show", {user: user});
    }
  });
});

// EDIT USER ROUTE
router.get("/users/:id/edit", isLoggedIn, isUserOrAdmin, function(req, res){
  User.findById(req.params.id, function(err, user){
    if(err){
      res.redirect("/users");
    } else {
      res.render("users/edit", {user: user});
    }
  });
});

// UPDATE USER ROUTE
router.put("/users/:id", isLoggedIn, isUserOrAdmin, function(req, res){
  req.body.user.body = req.sanitize(req.body.user.body);
  User.findByIdAndUpdate(req.params.id, req.body.user, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/users");
    } else {
      let showUrl = "/users/" + user._id;
      res.redirect(showUrl);
    }
  });
});

// DELETE ROUTE
router.delete("/users/:id", isLoggedIn, isUserOrAdmin, function(req, res){
  // Destroy user
  User.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/users");
    } else {
      res.redirect("/users");
    }
  });
});

// SHOW CHANGE PASSWORD ROUTE
router.get("/users/:id/change", isLoggedIn, isUserOrAdmin, function(req, res){
    User.findById(req.params.id, function(err, user){
      if(err){
        res.redirect("/users");
      } else {
        res.render("users/change", {user: user});
      }
    });
  });

//CHANGE PASSWORD
router.post('/users/:id/change', isLoggedIn, isUserOrAdmin, function (req, res) {
  async.waterfall([
    function(done){
      User.findOne({_id: req.params.id}, function(err, user){
        if(!user){
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm){
          user.setPassword(req.body.password, function(err){
            user.save(function(err){
              done(err, user);
            });
          });
        } else {
          return res.redirect('back');
        }
      });
    }
    ], function(err){
      res.redirect("/users/" + req.params.id);
  });
});

//Handle sign up logic
router.post("/register", function(req, res){
  let newUser = new User({
      username: req.body.username,
      email: req.body.email,
      fullname: req.body.fullname,
      role: req.body.role
  });
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function(){
       res.redirect("/"); 
    });
  });
});

//Show Login Form
router.get("/login", function(req, res){
  res.render("login"); 
});

//Handling Login Logic
router.post("/login", passport.authenticate("local", 
  {
    successRedirect:"/", 
    failureRedirect:"/login"
  }), function(req, res){
});

//LOGOUT ROUTE
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

// Middleware Login/Logout Route
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
};

// Middleware admin Route
function isAdmin(req, res, next){
  if(req.user.role === 'admin'){
    return next();
  }
  res.redirect("/");
};

// Middleware check admin or current user that create
function isUserOrAdmin(req, res, next){
	if(req.user.role === 'admin' | req.user.id === req.params.id){
		return next();
	}
	res.redirect("/");
};

module.exports = router;
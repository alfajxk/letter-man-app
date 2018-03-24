const express           = require("express"),
      app               = express(),
			fs								= require('fs'),
      mongoose          = require("mongoose"),
      passport          = require("passport"),
      LocalStrategy     = require("passport-local"),
      Schema            = mongoose.Schema,
      User              = require("./models/user"),
      bodyParser        = require("body-parser"),
      expressSanitizer  = require("express-sanitizer"),
      methodOverride    = require("method-override"),
      async             = require("async"),
      accounting        = require("accounting-js"),
      indexRoutes       = require("./routes/index"),
      letterRoutes      = require("./routes/letters"),
      memoRoutes        = require("./routes/memos"),
      noteRoutes        = require("./routes/notes"),
      nomRoutes         = require("./routes/noms"),
      documentRoutes    = require("./routes/documents"),
      inletterRoutes    = require("./routes/inletters"),
      inmemoRoutes    	= require("./routes/inmemos"),
      innoteRoutes      = require("./routes/innotes"),
			Letter						= require("./models/letter");
      

// PASSPORT CONFIG
app.use(require("express-session")({
  secret:"I AM The Handsome Man Ever Built By God can you ever imagine that?",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

// APP CONFIG
mongoose.connect("mongodb://localhost/letter_man", {useMongoClient: true});
mongoose.Promise = global.Promise;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.locals.accounting = accounting.formatNumber	;  
app.locals.lastId = 1;
app.locals.preNmbr = {
        "1": "000",
        "2": "00",
        "3": "0",
        "4": ""
        };   

var   dt = new Date();
      date = new Date().getDate(),
      month = new Date().getMonth()+1,
      dtFull = dt.getDate() + "-" + month + "-" +  dt.getFullYear(),
      newYear = date.toString() + month.toString(),
      year = new Date().getYear()+2,
      prefix = year.toString().slice(1),
      slh = "/",
      suffixMemo  = "-1/RFRR RO IV",
      suffixNote = "-2/RFRR RO IV",
      suffix = "-3/RFRR RO IV";

app.use(indexRoutes);
app.use(letterRoutes);
app.use(memoRoutes);
app.use(noteRoutes);
app.use(nomRoutes);
app.use(inletterRoutes);
app.use(inmemoRoutes);
app.use(innoteRoutes);
app.use(documentRoutes);

app.listen(3000, function(){
  console.log("==================== LetterMan Server Started =====================");
  console.log("  ======================== On Port 3000 =========================");
  console.log("   ============= developed by al farisi ibnu majah ============");
});
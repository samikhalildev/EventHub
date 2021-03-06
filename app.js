var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var expressValidator = require("express-validator");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require("mongodb");
var mongoose = require("mongoose");
var MongoClient = require('mongodb').MongoClient;

var db_URI = process.env.MONGODB_URI || "mongodb://localhost/eventhub";
mongoose.connect(db_URI);

var db = mongoose.connection;


// Store the routes for each page
var users = require("./routes/users");
var dashboard = require("./routes/dashboard");
var manager = require("./routes/manager");
var edit = require("./routes/edit");

var editDetails = require("./routes/editDetails");
var changePassword = require("./routes/changePassword");
// store routes here

// Init App
var app = express();

//No need to worry about all this, but must add path to a route below

// View Engine
app.engine("handlebars", exphbs({ defaultLayout: "layout"}));

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));



// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Express Session
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// Connect Flash
app.use(flash());

// Global Vars
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  user = req.user || null;
  res.locals.user = user;

  next();
});

//when a url path is requested, call the router for that page
app.use("/", dashboard);
app.use("/manager", manager);
app.use("/users", users);

app.use("/editDetails", editDetails);
app.use("/changePassword", changePassword);
app.use("/edit", edit);
//add path to a route here

// Set Port
app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), function() {
  console.log("Server started on port " + app.get("port"));
});

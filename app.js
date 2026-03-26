var express = require("express"),
  cookieParser = require("cookie-parser"),
  fileUpload = require("express-fileupload"),
  path = require("path"),
  session = require("express-session"),
  flash = require("express-flash"),
  dotenv = require("dotenv").config(),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  cors = require("cors"),
  moment = require("moment"),
  mainIndex = require("./routes/index"),
  apRouter = require("./routes/admin/routing"),
  siteApiRouter = require("./routes/site-api/v1/routing");
// mobileApiRouter = require('./routes/mobile-api/routing');
const sequelize = require("./config/dbconfig");
require("./models");

const RoleMenu = require("./models/role_menus");
const Menu = require("./models/menu");

const { adminUser, siteUser, mobileUser } = require("./lib/strategy");
const { Op } = require("sequelize");
const { socketio } = require("./lib/socketio");
const Bookings = require("./models/booking");

var app = express();
// app.set('trust proxy', true);
var httpServer = require("http").Server(app);

/*************Socket.io****************/
const io = require("socket.io")(httpServer, {
  cors: {
    origin: [
      "http://localhost:5000",
      // "https://domain.com",
    ],
    methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
socketio(io);
app.set("socketio", io);
/*************./Socket.io***************/
app.use(cors());
// app.options('*', cors())

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

//app.use(fileUpload()) // configure fileupload
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  })
);
// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static("public"));
app.use("/site", express.static(__dirname + "public/site"));
app.use("/admin", express.static(__dirname + "public/admin"));

app.use(express.static(__dirname + "/static"));

app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//serialize
passport.serializeUser(function (user, done) {
  done(null, user);
});
// deserialize
passport.deserializeUser(function (user, done) {
  if (user) {
    done(null, user);
  } else {
    done(new Error("User was not found: " + user.username, null));
  }
});
// authenticate admin user
passport.use(
  "admin_user",
  new LocalStrategy(
    { usernameField: "username" },
    (username, password, done) => {
      adminUser(username, password, done);
    }
  )
);
// For website side users
passport.use(
  "site_user",
  new LocalStrategy(
    { usernameField: "username" },
    (username, password, done) => {
      siteUser(username, password, done);
    }
  )
);
// For mobile side users
passport.use(
  "mobile_user",
  new LocalStrategy(
    { usernameField: "username" },
    (username, password, done) => {
      mobileUser(username, password, done);
    }
  )
);

app.use(async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, application/json, text/plain"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  res.locals.currentUser = req.user;
  res.locals.moment = moment;
  res.locals.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
  res.locals.GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;
  /*-------GET ROLE BASED MENUS---------*/
  if (req.user && req.user != undefined) {
    let menuIds = [];
    const roleMenuIds = await RoleMenu.findAll({
      attributes: ["id", "menu_id"],
      where: { role_id: req.user.role_id },
    });
    roleMenuIds.forEach((val) => {
      menuIds.push(Number(val.menu_id));
    });
    let userMenus = [];
    const menuArr = await RoleMenu.findAll({
      attributes: ["menu_id", "role_id", "action"],
      include: [
        {
          attributes: [
            "id",
            "title",
            "parent_id",
            "route",
            "slug",
            "query_param",
            "icon",
            "type",
            "sort",
          ],
          model: Menu,
          as: "menus",
          where: {
            parent_id: 0,
            status: 1,
            isDeleted: 0,
          },
          include: [
            {
              model: Menu,
              as: "submenus",
              separate: true,
              attributes: [
                "id",
                "title",
                "parent_id",
                "route",
                "slug",
                "query_param",
                "icon",
                "type",
                "sort",
              ],
              where: {
                id: {
                  [Op.in]: menuIds,
                },
                parent_id: {
                  [Op.ne]: 0,
                },
                status: 1,
                type: "sub-menu",
                isDeleted: 0,
              },
              order: [["sort", "ASC"]],
            },
          ],
        },
      ],
      where: {
        role_id: req.user.role_id,
      },
      order: [[{ model: Menu, as: "menus" }, "sort", "ASC"]],
    });
    menuArr.forEach((element) => {
      userMenus.push(element.menus);
    });
    res.locals.userMenus = userMenus;
  }
  /*-------./GET ROLE BASED MENUS---------*/
  const notificationList = await Bookings.findAll({
    where: {
      booking_status: "pending"
    },
    order: [["id", "DESC"]],
    limit: 10,
  });  
  res.locals.notificationList = notificationList;
  next();
});

// routes used
app.use(mainIndex);
app.use(apRouter);
app.use(siteApiRouter);
// app.use(mobileApiRouter)

// This will use to render 404 page when a route is not defined in ap
// Always keep this as last route
app.get("*", function (req, res) {
  res.render("admin/snippets/error-404", {
    url: req.headers.host + req.url,
    title: "Bad | Page Not Found",
    message: "Oops!, an error has been occured. Requested page was not found!",
  });
});

// set the app to listen on the port
const port = process.env.PORT || 5000;
sequelize
  .sync()
  .then(() => {
    console.log("Table created.");
    var server = httpServer.listen(port, () => {
      console.log("Web Backend Server is running on port", server.address().port);
    });
  })
  .catch((err) => {
    console.log("An error occured while creating table: " + err);
    process.exit(1);
  });

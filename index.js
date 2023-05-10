import _ from "./config/config.js"
import express, { urlencoded } from "express";
import { engine } from "express-handlebars";
import asyncError from 'express-async-errors';
import morgan from "morgan";
import database from "./database/db.js"
import express_handlebars_sections from "express-handlebars-sections";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import settingStrategy from "./config/passport-Strategy.js";
import moment from "moment/moment.js";



import homeRoute from "./routes/homeRoute.js"
import recipesRoute from "./routes/recipesRoute.js"
import profileRoute from "./routes/profileRoute.js"
import authRoute from "./routes/authRoute.js"
const app = express();

app.use("/public", express.static("public"));
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.engine('hbs', engine({
    extname: 'hbs',
    helpers:{
      section: express_handlebars_sections(),
      addOne(num){
        return num+1
      },
      isGreaterThanOne(num){
        return num > 1 
      },
      convertDate(utcStr){
        const dateFormated = moment(utcStr).format("hh:mm - MMMM D, YYYY")
        console.log(dateFormated)
        return dateFormated
      }
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
settingStrategy(passport);
app.use(passport.initialize());
app.use(passport.session())

app.use(morgan('dev'))

app.use(async (req,res, next) =>{
  if (req.cookies.user) {
    res.locals.isLogged = true;
    res.locals.auth = req.cookies.user;
  }
  if (req.session.passport && req.session.passport.user.status != "disabled") {
    res.locals.isLogged = true;
    res.locals.auth = req.session.passport.user;
    res.cookie("user", req.session.passport.user);
  }
  next();
})

app.use("/",homeRoute);
app.use("/recipes", recipesRoute)
app.use("/profile",profileRoute)
app.use("/auth",authRoute)

app.use((err,req,res, next)=> {
  console.log(err);
  next();
})
app.use((req,res)=>res.status(404).render('404',{layout: false}))
  
app.listen(process.env.PORT, ()=>{
      console.log(`Server running at http://127.0.0.1:${process.env.PORT}`);
})
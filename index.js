import _ from "./config/config.js"
import express, { urlencoded } from "express";
import { engine } from "express-handlebars";
import asyncError from 'express-async-errors';
import morgan from "morgan";
import database from "./database/db.js"
import express_handlebars_sections from "express-handlebars-sections";
import homeRoute from "./routes/homeRoute.js"
import recipesRoute from "./routes/recipesRoute.js"
import profileRoute from "./routes/profileRoute.js"
const app = express();

app.use("/public", express.static("public"));
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
      }
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(morgan('dev'))


app.use("/",homeRoute);
app.use("/recipes", recipesRoute)
app.use("/profile",profileRoute)

app.use((err,req,res, next)=> {
  console.log(err);
  next();
})
app.use((req,res)=>res.status(404).render('404',{layout: false}))
  
app.listen(process.env.PORT, ()=>{
      console.log(`Server running at http://127.0.0.1:${process.env.PORT}`);
})
import _ from "./config/config.js"
import express, { urlencoded } from "express";
import { engine } from "express-handlebars";
import asyncError from 'express-async-errors';
import morgan from "morgan";
const app = express();

app.use("/public", express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.engine('hbs', engine({
    extname: 'hbs',
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(morgan('dev'))

app.use("/", (req, res, next)=>{
    res.render('home', {
        binding: "truyền data"
    })
});
// app.use((err,req,res, next)=> {
//     console.log(err);
//     next();
//   })
// app.use((req,res)=>res.status(404).render('404',{layout: false}))
  
app.listen(process.env.PORT, ()=>{
      console.log(`Server running at http://127.0.0.1:${process.env.PORT}`);
})
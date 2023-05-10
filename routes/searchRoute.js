import express, { query, request } from 'express'
const Router = express.Router();
Router.get("/",(req, res, next)=>{
    res.render("vwSearch/search")
})
export default Router;
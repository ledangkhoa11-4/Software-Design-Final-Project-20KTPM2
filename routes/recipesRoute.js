import express, { query, request } from 'express'

const Router = express.Router();

Router.get('/create', async (req,res,next) => {
   res.render("vwRecipe/createRecipe")
})

export default Router;
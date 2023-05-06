import express, { query, request } from 'express'

const Router = express.Router();

Router.get('', async (req,res,next) => {
   res.status(200).render("home")
})

export default Router;
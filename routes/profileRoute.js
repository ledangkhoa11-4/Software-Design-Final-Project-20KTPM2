import express, { query, request } from 'express'
import multer from 'multer';
import fs from "fs"
const Router = express.Router();


 
Router.get('/sharedrecipe', async (req,res,next) => {
   res.render("vwProfile/sharedRecipe");
})

export default Router;
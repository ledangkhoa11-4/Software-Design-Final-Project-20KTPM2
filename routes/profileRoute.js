import express, { query, request } from 'express'
import multer from 'multer';
import fs from "fs"
import recipesService from '../service/recipesService.js';
const Router = express.Router();


 
Router.get('/sharedrecipe', async (req,res,next) => {
  const list=await recipesService.getAllRecipe()
  console.log(list);
   
   res.render("vwProfile/sharedRecipe", {
      list,
      isEmpty: list.length===0
   });
})

export default Router;
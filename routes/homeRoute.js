import express, { query, request } from 'express'
import recipesService from '../service/recipesService.js';
const Router = express.Router();

Router.get('', async (req,res,next) => {
   let data = {}
   let popularRecipe = await recipesService.getBestLike()
   let mostViewRecipe = await recipesService.getBestView()
   let newestRecipe = await recipesService.getNewest()
   data.pupularRecipes = popularRecipe
   data.mostViewRecipes = mostViewRecipe
   data.newestRecipes = newestRecipe
   res.status(200).render("home", data)
})

export default Router;
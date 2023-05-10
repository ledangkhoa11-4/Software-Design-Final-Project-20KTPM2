import express, { query, request } from 'express'
import multer from 'multer';
import fs from "fs"
import recipesService from '../service/recipesService.js';
import middlewares from '../middlewares/middlewares.js';
import { log } from 'console';
const Router = express.Router();
Router.use(middlewares.isLogged);


 
Router.get('/sharedrecipe', async (req,res,next) => {
   const p= parseInt(req.query.p)||1;
   const limit=3
   const offset=(p-1)*limit
   const email=req.query.email
   const nitems= await recipesService.CountRecipeSharedByUser(email)
   const nPage=Math.ceil(parseInt(nitems)/limit);
   const list=await recipesService.getRecipesByUser(email,offset,limit)
   const url=`/profile/sharedrecipe?email=${email}`
   res.render("vwProfile/sharedRecipe", {
      layout: 'profile',
      nPage,
      page:p,
      url,
      list,
      isEmpty: list.length===0
   });
})
Router.get('/favorite',async(req,res,next)=>{
   const page=parseInt(req.query.p)||1
   const limit=3
   const offset=(page-1)*limit
   const email=req.query.email
   const nitems=await recipesService.CountFavoriteRecipe(email)
   const nPage=Math.ceil(parseInt(nitems)/limit);
   
   const favRecipeList=await recipesService.getFavoriteRecipes(email)
   var recipeList=[favRecipeList.length]
   for(var i=0;i<favRecipeList.length;i++){
      recipeList[i]=await recipesService.getRecipe(favRecipeList[i].recipeID)
   }
   const url=`/profile/favorite?email=${email}`
   res.render("vwProfile/favoriteRecipe",{
      layout: 'profile',
      list:recipeList,
      nPage,
      page,
      url,
      isEmpty:favRecipeList.length===0
   })
})
Router.post('/favorite/remove',async(req,res,next)=>{
   const email=req.query.email
   const recipeID=req.query.recipeID
   const result= await recipesService.removeFavorite(email,recipeID)
   res.redirect(`/profile/favorite?email=${email}`)
})

Router.get('/account', async (req,res,next) =>{
   // const infos = await userService.getInfo(res.locals.auth.IDUser || 0);
   res.render('vwProfile/account');
})

export default Router;
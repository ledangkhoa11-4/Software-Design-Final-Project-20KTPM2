import express, { query, request } from 'express'
import multer from 'multer';
import recipesService from '../service/recipesService.js';
import fs from "fs"
const Router = express.Router();

const storage = multer.diskStorage({
   destination: async function (req, file, cb) {
     cb(null, `./public/images/recipes/${req.RecipeID}`);
   },
   filename: function (req, file, cb) {
      let ID = req.RecipeID;
      let imageType = file.fieldname
      let filename = ""
      if(req.imageCount[imageType] == undefined){
         req.imageCount[imageType] = 1
      }else{
         req.imageCount[imageType] += 1
      }
      filename = `${ID}_${imageType}_${req.imageCount[imageType]}`
     cb(null, filename + ".jpg");
   },
 });

 async function createBlankRecipe(poster){
   let addedRecipeID = await recipesService.addRecipe({poster})
   return addedRecipeID
}
const uploadCreate = multer({
   storage: storage,
 });
 
Router.get('/create', async (req,res,next) => {
   res.render("vwRecipe/createRecipe");
})
Router.post('/create',async (req,res,next)=>{
   let newID = await createBlankRecipe("ldkhoa.11402@gmail.com")
   const folderName = `./public/images/recipes/${newID}`;
   fs.mkdir(folderName, (err) => {
      if (err) {
        next(err);
      }
   });
   req.RecipeID = newID
   req.imageCount = {}
   next()
},uploadCreate.any(), async (req,res,next) => {
   let idupdate = req.RecipeID
   let steps = req.body.step
   let ingredients = req.body.ingredient
   delete(req.body.step)
   delete(req.body.ingredient)
   let updateData = await recipesService.updateRecipe(idupdate, req.body)
   for(let i = 1; i < steps.length; i++){
      let stepDesc = steps[i].name
      let obj = {
         recipeID: idupdate,
         id: i,
         stepName: stepDesc
      }
      let updateStep = await recipesService.addStep(obj)
   }
   for(let i = 1; i < ingredients.length; i++){
      let ingredientName = ingredients[i].name 
      let ingredientCalories = ingredients[i].calories 
      let obj = {
         recipeID: idupdate,
         id: i,
         name: ingredientName,
         calories: ingredientCalories
      }
      let updateIngre = await recipesService.addIngredient(obj)
   }
   res.render("vwRecipe/createRecipe", {
      isAlert: true,
      icon: "success",
      title: "Your recipe has been shared!",
    });
  
})
export default Router;
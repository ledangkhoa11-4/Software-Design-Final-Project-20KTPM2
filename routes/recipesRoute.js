import express, { query, request } from 'express'
import multer from 'multer';
import recipesService from '../service/recipesService.js';
import usersService from '../service/usersService.js';
import reportService from '../service/reportService.js';
import fs from "fs"
import middlewares from '../middlewares/middlewares.js';
import puppeteer from 'puppeteer';
import path from 'path';
import handlebars from 'handlebars';
import { isDataView } from 'util/types';
import { log } from 'console';
const Router = express.Router();

const storage = multer.diskStorage({
   destination: async function (req, file, cb) {
      cb(null, `./public/images/recipes/${req.RecipeID}`);
   },
   filename: function (req, file, cb) {
      let ID = req.RecipeID;
      let imageType = file.fieldname
      let filename = ""
      if (req.imageCount[imageType] == undefined) {
         req.imageCount[imageType] = 1
      } else {
         req.imageCount[imageType] += 1
      }
      filename = `${ID}_${imageType}_${req.imageCount[imageType]}`
      cb(null, filename + ".jpg");
   },
});


async function createBlankRecipe(poster) {
   let addedRecipeID = await recipesService.addRecipe({ poster })
   return addedRecipeID
}
const uploadCreate = multer({
   storage: storage,
});
Router.post("/comment/del", middlewares.isLogged, async(req,res,next)=>{
   const recipeId = req.body.recipeId;
   const email = req.body.email
   const delCmt = recipesService.deleteComment(recipeId, email)
   const url = "/recipes/" + recipeId
   if (delCmt) res.redirect(url)
   else res.json({ 404: "ERROR" })
})
Router.post("/comment/:id", middlewares.isLogged, async (req, res, next) => {
   const cmt = req.body.comment
   const email = res.locals.auth.email
   const date = new Date();

   const saveCmt = await recipesService.saveComment(req.params.id, cmt, email, date)
   const url = "/recipes/" + req.params.id
   if (saveCmt) res.redirect(url)
   else res.json({ 404: "ERROR" })
})
Router.get('/create', middlewares.isLogged, async (req, res, next) => {
   res.render("vwRecipe/createRecipe");
})
Router.post('/create', async (req, res, next) => {
   let userEmail = res.locals.auth.email
   let newID = await createBlankRecipe(userEmail)
   const folderName = `./public/images/recipes/${newID}`;
   fs.mkdir(folderName, (err) => {
      if (err) {
         next(err);
      }
   });
   req.RecipeID = newID
   req.imageCount = {}
   next()
}, uploadCreate.any(), async (req, res, next) => {
   let idupdate = req.RecipeID
   let steps = req.body.step
   let ingredients = req.body.ingredient
   delete (req.body.step)
   delete (req.body.ingredient)
   let updateData = await recipesService.updateRecipe(idupdate, req.body)
   for (let i = 1; i < steps.length; i++) {
      let stepDesc = steps[i].name
      let obj = {
         recipeID: idupdate,
         id: i,
         stepName: stepDesc
      }
      let updateStep = await recipesService.addStep(obj)
   }
   for (let i = 1; i < ingredients.length; i++) {
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
Router.get("/:id", async (req, res, next) => {
   let data = {}
   const regex = /step(\d+)/;
   const recipe = await recipesService.getRecipe(req.params.id)
   if (!recipe)
      return next("Recipe not found")
   let steps = await recipesService.getSteps(recipe.id)
   steps = steps.map(item => ({ ...item, imgs: [] }));
   const ingredients = await recipesService.getIngredients(recipe.id)
   let finishImgs = []
   fs.readdirSync(`./public/images/recipes/${recipe.id}`).forEach(file => {
      if (file.includes("finishImage"))
         finishImgs.push(`/public/images/recipes/${recipe.id}/${file}`)
      if (file.includes("step")) {
         let match = file.match(regex)
         if (match) {
            let imageAtStep = match[1]
            steps[imageAtStep - 1].imgs.push(`/public/images/recipes/${recipe.id}/${file}`)
         }
      }
   });
   let user = await usersService.findUserByEmail(recipe.poster)
   data.recipe = recipe
   data.steps = steps
   data.ingredients = ingredients
   data.finishImgs = finishImgs
   data.user = user
   let fullUrl = `${req.protocol + '://' + req.get('host') + req.originalUrl}`
   fullUrl = fullUrl.replace("localhost", "127.0.0.1")
   data.fullUrl = fullUrl
   data.mailInfo = {
      subject: `Cookery - Cách làm món ${recipe.Name}`,
      body: `Món này ngon cực! Bạn xem thử nhé?%0A%0A${fullUrl}
      `
   }
   if (res.locals.auth) {
      data.isOwn = data.user.email == res.locals.auth.email
      data.isLiked = await recipesService.checkLikeRecipe(res.locals.auth.email, req.params.id)
      data.isSaved = await recipesService.checkSaveRecipe(res.locals.auth.email, req.params.id)
   }
   else {
      data.isOwn = false
      data.isLiked = false
      data.isSaved = false
   }
   data.facebookInfo = {
      info: `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`
   }
   data.comments = await recipesService.getAllCmt(recipe.id)
   if (res.locals.auth){
      data.crrUser = res.locals.auth
      data.crrUser.avatar = data.crrUser.avatar.replace(`undifine.jpg`, `${data.crrUser.email}.jpg`);
      data.crrUser.cover = data.crrUser.cover.replace(`undifine.jpg`, `${data.crrUser.email}.jpg`);
   
      // Find the index of the first comment with an email equal to `userEmail`
      let swapIndex = -1;
      for (let i = 0; i < data.comments.length; i++) {
         if (data.comments[i].userEmail === data.crrUser.email) {
            swapIndex = i;
            break;
         }
      }
      // Swap the comments if a comment with an email equal to `userEmail` was found
      if (swapIndex >= 0) {
         const temp = data.comments[0];
         data.comments[0] = data.comments[swapIndex];
         data.comments[swapIndex] = temp;
      }
   
   }
   
   res.render("vwRecipe/detail", data)
   await recipesService.addView(recipe.id)
})
Router.get("/:id/print", async (req, res, next) => {
   const data = await getDataRecipe(req.params.id)
   let pdf = await convertPdf(data)
   res.setHeader('Content-Type', 'application/pdf');
   res.setHeader('Content-Disposition', `inline; filename=cookery.pdf`);
   res.send(pdf);

})
Router.get("/edit/:id", middlewares.isOwnRecipe, async (req, res, next) => {
   const recipeID = req.params.id
   const recipe = await recipesService.getRecipe(recipeID)
   const ingredients = await recipesService.getIngredients(recipeID)
   let steps = await recipesService.getSteps(recipeID)
   steps = steps.map(item => ({ ...item, imgs: [] }));
   const regex = /step(\d+)/;
   const data = {}
   let finishImgs = []
   fs.readdirSync(`./public/images/recipes/${recipeID}`).forEach(file => {
      if (file.includes("finishImage"))
         finishImgs.push(`${recipeID}/${file}`)
      if (file.includes("step")) {
         let match = file.match(regex)
         if (match) {
            let imageAtStep = match[1]
            steps[imageAtStep - 1].imgs.push(`${recipeID}/${file}`)
         }
      }
   });
   data.recipe = recipe
   data.finishImgs = finishImgs
   data.ingredients = ingredients
   data.numberIngres = ingredients.length
   data.numberSteps = steps.length
   data.steps = steps
   res.render("vwRecipe/editRecipe", data);
})
Router.post("/edit/:id", (req, res, next) => {
   req.newestImage = []
   req.RecipeID = req.params.id
   req.imageCount = {}
   next()

}, uploadCreate.any(), async (req, res, next) => {
   const recipeID = req.RecipeID
   const regex = /^[\d]+_([a-zA-Z0-9-]+)_([0-9]+)\.jpg$/;
   fs.readdirSync(`./public/images/recipes/${recipeID}`).forEach(file => {
      let matchPattern = file.match(regex)
      if (matchPattern[2] > req.imageCount[matchPattern[1]])
         fs.unlinkSync(`./public/images/recipes/${recipeID}/${file}`)
   });
   let steps = req.body.step
   let ingredients = req.body.ingredient
   delete (req.body.step)
   delete (req.body.ingredient)
   let updateData = await recipesService.updateRecipe(recipeID, req.body)
   let removeStep = await recipesService.removeSteps(recipeID)
   let removeIngredients = await recipesService.removeIngredients(recipeID)
   for (let i = 1; i < steps.length; i++) {
      let stepDesc = steps[i].name
      let obj = {
         recipeID: recipeID,
         id: i,
         stepName: stepDesc
      }
      let updateStep = await recipesService.addStep(obj)
   }
   for (let i = 1; i < ingredients.length; i++) {
      let ingredientName = ingredients[i].name
      let ingredientCalories = ingredients[i].calories
      let obj = {
         recipeID: recipeID,
         id: i,
         name: ingredientName,
         calories: ingredientCalories
      }
      let updateIngre = await recipesService.addIngredient(obj)
   }
   res.json(req.body)
})
Router.post("/report/:id", async (req, res, next) => {
   let reporter = res.locals.auth.email
   let idRecipe = req.params.id
   let reason = req.body.reason
   const data = {
      UserReport: reporter,
      recipeReported: idRecipe,
      reason
   }
   let resData = {
      status: "",
      msg: ""
   }
   try {
      const addReport = await reportService.addReport(data)
      resData = {
         status: "success",
         msg: ""
      }
   } catch (err) {
      resData = {
         status: "failure",
         msg: "You have already reported this recipe"
      }
   }
   res.json(resData)
})
Router.post("/like/:id", async (req, res, next) => {
   let type = req.body.type
   let status = "Success"
   let msg = ""
   const data = {
      userEmail: res.locals.auth.email,
      recipeID: req.params.id,
   }
   try {
      if (type == 'true' || type == true) {
         const update = await recipesService.addLike(data)
         msg = "Thank you for loving this post!!!"
      } else {
         const update = await recipesService.removeLike(data)
         msg = "Unlove successfully!!!"
      }
   } catch (err) {
      msg = err.toString()
      status = "Error"
   }
   res.json({ msg, status })
})
Router.post("/save/:id", async (req, res, next) => {
   let type = req.body.type
   let status = "Success"
   let msg = ""
   const data = {
      userEmail: res.locals.auth.email,
      recipeID: req.params.id,
   }
   try {
      if (type == 'true' || type == true) {
         const update = await recipesService.saveRecipe(data)
         msg = "Save recipe successfully!!!"
      } else {
         const update = await recipesService.unsaveRecipe(data)
         msg = "Unsave recipe successfully!!!"
      }
   } catch (err) {
      msg = err.toString()
      status = "Error"
   }
   res.json({ msg, status })
})

async function getDataRecipe(id) {
   let data = {}
   const regex = /step(\d+)/;
   const recipe = await recipesService.getRecipe(id)
   if (!recipe)
      return data
   let steps = await recipesService.getSteps(recipe.id)
   steps = steps.map(item => ({ ...item, imgs: [] }));
   const ingredients = await recipesService.getIngredients(recipe.id)
   let finishImgs = []
   fs.readdirSync(`./public/images/recipes/${recipe.id}`).forEach(file => {
      let base64 = fs.readFileSync(`./public/images/recipes/${recipe.id}/${file}`).toString("base64")
      if (file.includes("finishImage")) {
         finishImgs.push(base64)
      }
      if (file.includes("step")) {
         let match = file.match(regex)
         if (match) {
            let imageAtStep = match[1]
            steps[imageAtStep - 1].imgs.push(base64)
         }
      }
   });
   let user = await usersService.findUserByEmail(recipe.poster)
   data.recipe = recipe
   data.steps = steps
   data.ingredients = ingredients
   data.finishImgs = finishImgs
   data.user = user
   return data
}
async function convertPdf(data) {
   const templateSource = fs.readFileSync('./views/vwRecipe/formatPdf.hbs', 'utf8');
   const template = handlebars.compile(templateSource);
   const html = template(data);
   const browser = await puppeteer.launch({ headless: "new", args: ['--disable-network'] });
   const page = await browser.newPage();
   await page.setContent(html);
   const pdf = await page.pdf({ format: 'A4' });
   await browser.close();
   return pdf
}
export default Router;
import express, { query, request } from 'express'
import searchService from '../service/searchService.js';
import fs from "fs"
const Router = express.Router();
Router.get("/",(req, res, next)=>{
    res.render("vwSearch/search",{
        isEmpty: true
    })
})
Router.post("/",async (req,res,next)=>{
    const searchKey = req.body['search-key'];
    const listRecipe = await searchService.getListRecipe(searchKey);
    var thumbnail = []
    for (let i = 0; i < listRecipe.length; i++) {
        const recipeId = listRecipe[i].id;
        listRecipe[i].thumbnail = `/public/images/recipes/${recipeId}/${recipeId}_finishImage_1.jpg`;
        var total = await searchService.getTotalCalories(recipeId)
        listRecipe[i].total_calories = total[0].total_calories
        listRecipe[i].num_ingredients = total[0].num_ingredients
        if (listRecipe[i].fullname != "") listRecipe[i].posterName = listRecipe[i].fullname
        else listRecipe[i].posterName = listRecipe[i].poster
    }
    res.render("vwSearch/search",{
        searchKey,
        listRecipe,
        isEmpty:listRecipe.length===0
    })
})
export default Router;
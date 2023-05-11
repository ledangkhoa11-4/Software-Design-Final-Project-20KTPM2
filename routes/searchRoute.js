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
    const sortKey = req.body.selectThis;
    const sortType = req.body.radioButton;

   
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
        var num_likes = await searchService.getTotalLike(recipeId)
        listRecipe[i].num_likes = num_likes
    }

    if (sortKey!=undefined && sortType!=undefined){
        if (sortKey=="calories"){
            if (sortType=="ascending") listRecipe.sort((a, b) => (a.total_calories > b.total_calories) ? 1 : -1);
            else listRecipe.sort((a, b) => (a.total_calories < b.total_calories) ? 1 : -1);
        }else if (sortKey=="name"){
                if (sortType=="ascending") listRecipe.sort((a, b) => (a.Name > b.Name) ? 1 : -1);
                else listRecipe.sort((a, b) => (a.Name < b.Name) ? 1 : -1);
        }else if (sortKey=="like"){
            if (sortType=="ascending") listRecipe.sort((a, b) => (a.num_likes > b.num_likes) ? 1 : -1);
            else listRecipe.sort((a, b) => (a.num_likes < b.num_likes) ? 1 : -1);
        }
    }

    res.render("vwSearch/search",{
        searchKey,
        listRecipe,
        isEmpty:listRecipe.length===0,
        sortType,
        sortKey
    })
})
export default Router;
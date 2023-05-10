import database from "../database/db.js"

export default{
    addRecipe:async(data)=>{
        const addedRecipe = await database('Recipe').insert(data)
        return addedRecipe[0];
    },
    updateRecipe:async(recipeID, data)=>{
        const addedRecipe = await database('Recipe').where({id: recipeID}).update(data)
        return addedRecipe[0];
    },
    addIngredient: async(data)=>{
        const addedIngre = await database('ingredients').insert(data)
        return addedIngre[0];
    },
    addStep: async(data)=>{
        const addedStep = await database('steps').insert(data)
        return addedStep[0];
    },
    getAllRecipe:async()=>{
        const list=await database('Recipe')
        
        return list
    },
    getRecipe: async(id)=>{
        const recipe = await database("Recipe").where({id})
        if(recipe)
            return recipe[0]
    },
    getIngredients: async(id)=>{
        const ingre = await database("ingredients").where({recipeID: id})
        if(ingre)
            return ingre
    },
    getSteps: async(id)=>{
        const steps = await database("steps").where({recipeID: id})
        if(steps)
            return steps
    },
    removeSteps: async(id)=>{
        const rowRemove = await database("steps").where({recipeID: id}).del()
        return rowRemove
    },
    removeIngredients: async(id)=>{
        const rowRemove = await database("ingredients").where({recipeID: id}).del()
        return rowRemove
    },
    addView: async(id)=>{
        const update = await database.raw(`UPDATE Recipe SET view = view + 1 WHERE id = '${id}'`)
    },
    getFavoriteRecipes:async(email)=>{
        const favorite=await database('favoriteRecipes').where({userEmail:email});
        return favorite;
    },
    removeFavorite:async(email, id)=>{
        const rowRemove=await database('favoriteRecipes').where({userEmail:email, recipeID:id}).del()
        return rowRemove
    },
    getRecipesByUser:async(email,offset,limit)=>{
        const list=await database('Recipe').where({poster:email}).offset(offset).limit(limit)
        return list
    },
    CountRecipeSharedByUser:async(email)=>{
        const count=await database.raw(`SELECT count(*) as c FROM Recipe WHERE poster='${email}'`)
        return count[0][0].c
    },
    CountFavoriteRecipe:async(email)=>{
        const count=await database.raw(`SELECT count(*) as c FROM favoriteRecipes WHERE userEmail='${email}'`)
        return count[0][0].c
    }

}

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
    }

}

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
    },
    getAllBriefRecipe:async(data)=>{
        let whereClause = '1 '
        let offsetClause = ''
        let limitClause = ''
        if(data.id != undefined)
            whereClause += `&& r.id='${data.id}'`
        if(data.email != undefined)
            whereClause += `&& r.poster='${data.email}'`
        if(data.offset != undefined)
            offsetClause = `OFFSET ${data.offset}`
        if(data.limit != undefined)
            limitClause = `LIMIT ${data.limit}`
        const result = await database.raw(`
        SELECT *, 
            (SELECT COUNT(*) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as numIngres, 
            (SELECT SUM(i.calories) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as totalCalories, 
            (SELECT COUNT(*) FROM steps s WHERE s.recipeID = r.id GROUP BY r.id) as numSteps,
            IFNULL((SELECT COUNT(*) FROM likes l WHERE l.recipeID = r.id GROUP BY r.id),0) as numLikes
        FROM Recipe r WHERE ${whereClause} ${limitClause} ${offsetClause}
        `)
        return result[0]
    },
    addLike: async(data)=>{
        const result = await database("likes").insert(data);
        return result
    },
    removeLike: async(data)=>{
        const result = await database("likes").where(data).del();
        return result
    },
    getBestLike: async()=>{
        const result = await database.raw(`
        SELECT r.*, a.fullname, 
        (SELECT COUNT(*) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as numIngres, 
        (SELECT SUM(i.calories) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as totalCalories, 
        (SELECT COUNT(*) FROM steps s WHERE s.recipeID = r.id GROUP BY r.id) as numSteps,
        IFNULL((SELECT COUNT(*) FROM likes l WHERE l.recipeID = r.id GROUP BY r.id),0) as numLikes
    FROM Recipe r LEFT JOIN Account a ON a.email = r.poster WHERE 1 ORDER BY numLikes DESC LIMIT 5
        `)
        return result[0]
    },
    getBestView: async()=>{
        const result = await database.raw(`
        SELECT r.*, a.fullname, 
        (SELECT COUNT(*) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as numIngres, 
        (SELECT SUM(i.calories) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as totalCalories, 
        (SELECT COUNT(*) FROM steps s WHERE s.recipeID = r.id GROUP BY r.id) as numSteps,
        IFNULL((SELECT COUNT(*) FROM likes l WHERE l.recipeID = r.id GROUP BY r.id),0) as numLikes
    FROM Recipe r LEFT JOIN Account a ON a.email = r.poster WHERE 1 ORDER BY r.view DESC LIMIT 5
        `)
        return result[0]
    }, 
    getNewest: async()=>{
        const result = await database.raw(`
        SELECT r.*, a.fullname, 
        (SELECT COUNT(*) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as numIngres, 
        (SELECT SUM(i.calories) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as totalCalories, 
        (SELECT COUNT(*) FROM steps s WHERE s.recipeID = r.id GROUP BY r.id) as numSteps,
        IFNULL((SELECT COUNT(*) FROM likes l WHERE l.recipeID = r.id GROUP BY r.id),0) as numLikes
    FROM Recipe r LEFT JOIN Account a ON a.email = r.poster WHERE 1 ORDER BY r.datePosted DESC LIMIT 10
        `)
        return result[0]
    }, 
}

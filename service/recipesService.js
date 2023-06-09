
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
    getFavoriteRecipes:async(email,offset,limit)=>{
        const favorite=await database('favoriteRecipes').where({userEmail:email}).offset(offset).limit(limit);
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
    getRecipesByUserEmail:async(email)=>{
        let whereClause = ' '
        if(email != undefined)
            whereClause += `r.poster='${email}'`
        
        const result = await database.raw(`
        SELECT *, 
            (SELECT COUNT(*) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as numIngres, 
            (SELECT SUM(i.calories) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as totalCalories, 
            (SELECT COUNT(*) FROM steps s WHERE s.recipeID = r.id GROUP BY r.id) as numSteps,
            IFNULL((SELECT COUNT(*) FROM likes l WHERE l.recipeID = r.id GROUP BY r.id),0) as numLikes
        FROM Recipe r WHERE ${whereClause}
        `)
        return result[0]
    },
    addLike: async(data)=>{
        const result = await database("likes").insert(data);
        let numLike = await database.raw(`select count(*) as numlike from likes WHERE likes.recipeID = ${data.recipeID}`)
        numLike = numLike[0][0].numlike

        let returnStr;
        if(numLike <= 1){
            returnStr = "You are the first person love this post"
        }else{
            returnStr = `You and ${numLike-1} people love this`
        }
        return returnStr
    },
    removeLike: async(data)=>{
        const result = await database("likes").where(data).del();
        let numLike = await database.raw(`select count(*) as numlike from likes WHERE likes.recipeID = ${data.recipeID}`)
        numLike = numLike[0][0].numlike
        let returnStr =  `${numLike} people love this`
        if(numLike <= 0)
            returnStr =  `Be the first person love this`
        return returnStr
    },
    getLike: async(recipeID)=>{
        let numLike = await database.raw(`select count(*) as numlike from likes WHERE likes.recipeID = ${recipeID}`)
        numLike = numLike[0][0].numlike
        return numLike
    },
    getBestLike: async()=>{
        const result = await database.raw(`
        SELECT r.*, a.fullname, a.email,a.avatar, 
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
        SELECT r.*, a.fullname, a.email,a.avatar,
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
        SELECT r.*, a.fullname, a.email,a.avatar,
        (SELECT COUNT(*) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as numIngres, 
        (SELECT SUM(i.calories) FROM ingredients i WHERE i.recipeID = r.id GROUP BY r.id) as totalCalories, 
        (SELECT COUNT(*) FROM steps s WHERE s.recipeID = r.id GROUP BY r.id) as numSteps,
        IFNULL((SELECT COUNT(*) FROM likes l WHERE l.recipeID = r.id GROUP BY r.id),0) as numLikes
    FROM Recipe r LEFT JOIN Account a ON a.email = r.poster WHERE 1 ORDER BY r.datePosted DESC LIMIT 10
        `)
        return result[0]
    }, 
    saveRecipe: async(data)=>{
        const result = await database("favoriteRecipes").insert(data);
        return result
    },
    unsaveRecipe: async(data)=>{
        const result = await database("favoriteRecipes").where(data).del();
        return result
    },
    checkSaveRecipe: async(email,recipeID)=>{
        const list = await database.raw(`Select * From favoriteRecipes where favoriteRecipes.userEmail LiKE '${email}' and favoriteRecipes.recipeID like '${recipeID}'`);
        if(list){
            return (list[0].length !== 0);
        }
        return null;
    },
    checkLikeRecipe: async(email,recipeID)=>{
        const list = await database.raw(`Select * From likes where likes.userEmail LiKE '${email}' and likes.recipeID like '${recipeID}'`);
        if(list){
            return (list[0].length !== 0);
        }
        return null;
    },
    getAllCmt: async(id)=>{
        const listCmt = await database.raw(`SELECT a.fullname, a.avatar ,c.* FROM comments c JOIN Account a ON c.userEmail = a.email WHERE c.recipeID = ${id};`)
        if (listCmt) return listCmt[0]
    },
    saveComment: async (recipeId, cmt, email, date) => {
        const res = await database.raw(`INSERT INTO comments (userEmail, recipeID, content, date)
          VALUES ('${email}', ${recipeId}, '${cmt}', NOW())
          ON DUPLICATE KEY UPDATE content = '${cmt}', date = NOW();
        `);
        return res;
    },
    deleteComment: async (recipeID, email) => {
        const res = await database.raw(`DELETE FROM reportedComments
          WHERE userReported = '${email}' AND recipeID = ${recipeID}`);
      
        const res2 = await database.raw(`DELETE FROM comments
          WHERE userEmail = '${email}' AND recipeID = ${recipeID}`);
      
        return res;
      },
      
    countReportedRecipe:async(id)=>{
        const count=await database.raw(`SELECT count( *) as c FROM reportedRecipes where recipeReported='${id}'`)
        return count[0][0].c
    },
    getReportedRecipe:async(id,offset,limit)=>{
        const list=await database.raw(`SELECT r.*, p.Name
        FROM Recipe p JOIN reportedRecipes r ON p.id = r.recipeReported
        where r.recipeReported='${id}'
        LIMIT ${offset},${limit}`)
        return list[0]
    },  
    getRecipesByPage: async (limit, offset) => {
        const list = await database("Recipe")
          .limit(limit)
          .offset(offset);
        return list;
    },
    getRecipesAmount: async () => {
        const list = await database("Recipe").count({amount: "id"});
        return list[0].amount;
    },
    disabledRecipe: (id, status) => {
        return database.raw(
          `Update Recipe set isbaned=${status} where Recipe.id='${id}'`
        );
    },
    
    countLike:async(id)=>{
        const count=await database.raw(`Select count(*) as c from likes where recipeID=${id}`)
        return count[0][0].c
    },
    getReportedRecipesByPage:async(limit,offset)=>{
        const list=await database.raw(`SELECT p.*,r.* 
        FROM Recipe p JOIN reportedRecipes r ON p.id = r.recipeReported
        GROUP BY r.recipeReported
        LIMIT ${offset},${limit} `)
        return list[0]
    },
    getReportedRecipesAmount: async () => {
        const count=await database.raw(`SELECT count(DISTINCT recipeReported) as c FROM reportedRecipes;`)
        return count[0][0].c
    },
    getBanedRecipesByPage: async(limit,offset)=>{
        const list=await database.raw(`SELECT p.*
        FROM Recipe p 
        Where p.isbaned = 1
        LIMIT ${offset},${limit} `)
        return list[0]
    },
    getBanedRecipesAmount: async () => {
        const count=await database.raw(`SELECT count(DISTINCT id) as c FROM Recipe WHERE Recipe.isbaned = 1;`)
        return count[0][0].c
    },
    getReportedTimes: async (id) =>{
        const count=await database.raw(`SELECT count(*) as c FROM reportedRecipes WHERE reportedRecipes.recipeReported = '${id}';`)
        return count[0][0].c 
    },
}


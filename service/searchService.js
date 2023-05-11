import database from "../database/db.js"

export default{
    getListRecipe: async(key)=>{
        const list = await database.raw(`SELECT DISTINCT Recipe.id, Recipe.Name, Recipe.poster, Account.avatar, Account.fullname, Recipe.datePosted, SUM(ingredients.calories) as total_calories, COUNT(DISTINCT steps.id) as num_steps, COUNT(DISTINCT ingredients.id) as num_ingredients, Recipe.preparationTime, Recipe.cookingTime, Recipe.description FROM Recipe INNER JOIN Account ON Recipe.poster = Account.email LEFT JOIN ingredients ON Recipe.id = ingredients.recipeID LEFT JOIN steps ON Recipe.id = steps.recipeID INNER JOIN (SELECT recipeID, SUM(calories) as total_calories FROM ingredients GROUP BY recipeID) as cal ON Recipe.id = cal.recipeID WHERE MATCH (Recipe.Name) AGAINST (n'${key}' IN BOOLEAN MODE) OR MATCH (ingredients.name) AGAINST (n'${key}' IN BOOLEAN MODE) GROUP BY Recipe.id ORDER BY Recipe.datePosted DESC;`)
        if (list) return list[0]
    },
    getTotalCalories: async(id)=>{
        const total = await database.raw(`SELECT COUNT(*) as num_ingredients, SUM(calories) as total_calories FROM ingredients WHERE recipeID = ${id}
        `)
        if (total) return total[0]
    }
}
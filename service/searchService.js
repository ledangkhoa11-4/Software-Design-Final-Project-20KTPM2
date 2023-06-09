import database from "../database/db.js"

export default{
    getListRecipe: async(key)=>{
        const list = await database.raw(`SELECT DISTINCT Recipe.id,Recipe.isbaned, Recipe.Name, Recipe.poster, Account.avatar, Account.fullname, Recipe.datePosted, SUM(ingredients.calories) as total_calories, COUNT(DISTINCT steps.id) as num_steps, COUNT(DISTINCT ingredients.id) as num_ingredients, Recipe.preparationTime, Recipe.cookingTime, Recipe.description FROM Recipe INNER JOIN Account ON Recipe.poster = Account.email LEFT JOIN ingredients ON Recipe.id = ingredients.recipeID LEFT JOIN steps ON Recipe.id = steps.recipeID INNER JOIN (SELECT recipeID, SUM(calories) as total_calories FROM ingredients GROUP BY recipeID) as cal ON Recipe.id = cal.recipeID WHERE (MATCH (Recipe.Name) AGAINST (n'${key}' IN BOOLEAN MODE) OR MATCH (ingredients.name) AGAINST (n'${key}' IN BOOLEAN MODE)) AND Recipe.isbaned = 0 GROUP BY Recipe.id ORDER BY Recipe.datePosted DESC;`)
        if (list) return list[0]
    },
    getTotalCalories: async(id)=>{
        const total = await database.raw(`SELECT COUNT(*) as num_ingredients, SUM(calories) as total_calories FROM ingredients WHERE recipeID = ${id}
        `)
        if (total) return total[0]
    },
    getTotalLike: async(id)=>{
        const total = await database.raw(`SELECT COUNT(*) AS num_likes FROM likes WHERE recipeID = ${id};
        `)
        if (total) return total[0]
    },
    getAllRecentSearch: async()=>{
        const total = await database.raw(`SELECT * FROM recent;
        `)
        if (total) return total[0]
    },
    addRecentSearch: async (searchKey) => {
        const existingRecord = await database.raw(`SELECT * FROM recent WHERE \`key\` = '${searchKey}'`);
        if (existingRecord[0].length > 0) {
          // The record already exists, return without inserting a new one
          return existingRecord[0][0].id;
        }
        const limit = await database.raw(`SELECT * FROM recent;`)
        if (limit[0].length > 10) {
            const del = await database.raw(`DELETE FROM recent LIMIT 1;
            `)
        }
        const total = await database.raw(`INSERT INTO recent (\`key\`) VALUES ('${searchKey}')`);
        if (total) return total[0].insertId;
      },
      
      
}
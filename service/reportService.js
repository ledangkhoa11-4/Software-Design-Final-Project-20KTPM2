import database from "../database/db.js"

export default{
    addReport: async(data)=>{
        const add = await database("reportedRecipes").insert(data)
        return add
    },
    addReportComment: async (reporter, userReported, idRecipe, reason) => {
        const add = await database.raw(`
          INSERT INTO reportedComments (UserReport, userReported, recipeID, reason)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE reason = ?
        `, [reporter, userReported, idRecipe, reason, reason]);
        return add
      }
      
}
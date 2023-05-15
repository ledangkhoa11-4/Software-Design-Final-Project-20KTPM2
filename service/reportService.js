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
      },
      getAllReport: async()=>{
        const query = await database.raw(`
        SELECT r.recipeID, r.userReported, GROUP_CONCAT(DISTINCT r.reason SEPARATOR ', ') as reason, COUNT(*) as numberReports, c.content FROM reportedComments r LEFT JOIN comments c on r.userReported = c.userEmail AND r.recipeID = c.recipeID WHERE 1 GROUP by r.userReported, r.recipeID
        `)
        if (query)
          return query[0]
      },
      deleteComment: async(data)=>{
        const del = await database("comments").where(data).del()
        return del
      },
      deleteReport: async(data)=>{
        const del = await database("reportedComments").where(data).del()
        return del
      }
}
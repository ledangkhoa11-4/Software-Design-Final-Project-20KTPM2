import database from "../database/db.js"

export default{
    addReport: async(data)=>{
        const add = await database("reportedRecipes").insert(data)
        return add
    }
}
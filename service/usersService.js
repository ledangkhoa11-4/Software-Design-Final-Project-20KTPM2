import database from '../database/db.js';
import db from '../database/db.js';

export default{
    findUserByEmail:async(userEmail)=>{
        const list =await db('Account').where('email',userEmail);
        if(list)
            return list[0];
        return null;
    },
    getUserByEmail: async(email)=>{
        const user = await db.raw(`Select * From Account u Where u.email Like '${email}'`);
        if(user)
            return user[0]
        return user;
    },
    verified: async(email, OTP)=>{
        const rowEffected = await db.raw(`Update Account u Set u.OTP = 0 Where u.email = '${email}' and u.OTP = ${OTP}`);
        if(rowEffected)
            return rowEffected[0];
        return 0;
    },
    isVerified: async(email)=>{
        const user = await db.raw(`Select u.OTP From Account u Where u.email Like '${email}'`);
        if(user)
            return user[0][0].OTP == 0;
        return false;
    },
    isEmailExists: async(email)=>{
        const list = await db.raw(`Select * From Account where Account.email LiKE '${email}'`);
        if(list){
            return (list[0].length !== 0);
        }
        return null;
    },
    isNameExists: async(fullname, name) => {
        const curName = await db.raw(`Select fullname From Account where Account.fullname LIKE '${fullname}'`);
        if(curName[0][0].fullname.localeCompare(name) === 0) return true;
        return false;            
    },
    addUser: async(user)=>{
        const result = await db('Account').insert(
            user
         )
        return result[0];
    },
    updateInfo: async(email, infos)=>{
        const result = await db('Account').where({email: email}).update(infos);
        return result[0]
    },
    GetFollowingUser:async(email,offset,limit)=>{
        const list=await db('follows').select('followedUser').where({follower:email}).offset(offset).limit(limit)
        return list
    },
    CountFollowingUser:async(email)=>{
        const count= await db.raw(`Select count(*) as c from follows where follower='${email}'`)
        return count[0][0].c
    },
    followUser:async(follower,followedUser)=>{
        const result=await db('follows').insert({
            follower:follower,
            followedUser:followedUser
        })
        return result
    },
    isFollow:async(follower,followedUser)=>{
        const result=await db('follows').where({follower:follower,followedUser:followedUser})
        return result
    },
    unFollow:async(follower,followedUser)=>{
        const result=await db('follows').where({follower:follower,followedUser:followedUser}).del()
        return result
    },
    getReportedUser:async(offset,limit)=>{
        const list=await db.raw(`SELECT p.*,r.* 
        FROM Account p JOIN reportedAccount r ON p.email = r.userReported
        GROUP BY r.userReported
        LIMIT ${offset},${limit} `)
        return list[0]
    },
    countReprtedUser:async()=>{
        const count=await db.raw(`SELECT count(DISTINCT userReported) as c FROM reportedAccount;`)
        return count[0][0].c
    },
    getUsersByPage: async (limit, offset) => {
        const list = await db("Account")
          .where('role',2)
          .limit(limit)
          .offset(offset);
        return list;
    },
    getUsersAmount: async () => {
        const list = await db("Account").where("role",2).count({amount: "email"});
        return list[0].amount;
    },
    disabledUser: (email, status) => {
        return db.raw(
          `Update Account set isbaned=${status} where Account.email='${email}'`
        );
    },
    reportUser:async(userReport,reason,userReported)=>{
        const result=await db('reportedAccount').insert({
            userReport:userReport,
            userReported:userReported,
            reason:reason
        })
        return result
    },
    getReportedUsersByPage:async(limit,offset)=>{
        const list=await db.raw(`SELECT p.*,r.* 
        FROM Account p JOIN reportedAccount r ON p.email = r.userReported
        GROUP BY r.userReported
        LIMIT ${offset},${limit} `)
        return list[0]
    },
    getReportedUsersAmount: async () => {
        const count=await db.raw(`SELECT count(DISTINCT userReported) as c FROM reportedAccount;`)
        return count[0][0].c
    },
    getBanedUsersByPage: async(limit,offset)=>{
        const list=await db.raw(`SELECT p.*
        FROM Account p 
        Where p.isbaned = 1
        LIMIT ${offset},${limit} `)
        return list[0]
    },
    getBanedUsersAmount: async () => {
        const count=await db.raw(`SELECT count(DISTINCT email) as c FROM Account WHERE Account.isbaned = 1;`)
        return count[0][0].c
    },
    getReportedTimes: async (email) =>{
        const count=await db.raw(`SELECT count(*) as c FROM reportedAccount WHERE reportedAccount.userReported = '${email}';`)
        return count[0][0].c 
    },
    getReportedUsersSearchByPage: async (key,limit,offset)=>{
        const list = await db.raw(`SELECT a.*
        FROM Account a INNER JOIN reportedAccount r
        ON a.email = r.userReported
        WHERE MATCH (a.fullname) AGAINST ('${key}' IN BOOLEAN MODE) 
        GROUP BY r.userReported
        LIMIT ${offset},${limit};`);
        if(list) return list[0];
    },
    getReportedUserSearchAmount: async (key)=>{
        const total = await db.raw(`SELECT COUNT(*) as c
        FROM(
                SELECT a.email
                FROM Account a INNER JOIN reportedAccount r
                ON a.email = r.userReported
                WHERE MATCH (a.fullname) AGAINST ('${key}' IN BOOLEAN MODE) 
                GROUP BY r.userReported) search_amount;`);
        if(total) return total[0][0].c;
    },
    getBanedUsersSearchByPage: async (key,limit,offset)=>{
        const list = await db.raw(`SELECT *
        FROM Account
        WHERE MATCH (fullname) AGAINST ('${key}' IN BOOLEAN MODE) AND isbaned = 1 LIMIT ${offset},${limit};`);
        if(list) return list[0];
    },
    getBanedUsersSearchAmount: async (key)=>{
        const list = await db.raw(`SELECT COUNT(*) as c
        FROM Account
        WHERE MATCH (fullname) AGAINST ('${key}' IN BOOLEAN MODE) AND isbaned = 1;`);
        if(list) return list[0][0].c;
    },
    getUsersSearchByPage: async (key,limit,offset)=>{
        const list = await db.raw(`SELECT *
        FROM Account
        WHERE MATCH (fullname) AGAINST ('${key}' IN BOOLEAN MODE) LIMIT ${offset},${limit};`);
        if(list) return list[0];
    },
    getUsersSearchAmount: async (key)=>{
        const list = await db.raw(`SELECT COUNT(*) as c
        FROM Account
        WHERE MATCH (fullname) AGAINST ('${key}' IN BOOLEAN MODE);`);
        if(list) return list[0][0].c;
    },
}
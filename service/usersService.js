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
    }
}
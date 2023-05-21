import express, { query, request } from 'express'
import multer from 'multer';
import fs from "fs"
import recipesService from '../service/recipesService.js';
import usersService from '../service/usersService.js'
import bcrypt from 'bcrypt'

import middlewares from '../middlewares/middlewares.js';


const Router = express.Router();
Router.use(middlewares.isLogged);
const storageAvatar = multer.diskStorage({
   destination: function (req, file, cb) {
      if(file.fieldname == "avatar")
         cb(null, "./public/images/users/avatar");
      else if(file.fieldname == "cover") cb(null, "./public/images/users/cover");
   },
   filename: function (req, file, cb) {
     const id = req.cookies.user.email || "undefine";
     cb(null, id + ".jpg");
   },
});

const uploadAvatarEdit = multer({
   fileFilter: async (req, file, cb) => {     
      if(file.fieldname == "avatar") req.avatarAdded = true;
      else if(file.fieldname == "cover") req.coverAdded = true;
     cb(null, true);
   },
   storage: storageAvatar,
});


 
Router.get('/sharedrecipe', async (req,res,next) => {
   const p= parseInt(req.query.p)||1;
   const limit=3
   const offset=(p-1)*limit
   const email=req.query.email
   const nitems= await recipesService.CountRecipeSharedByUser(email)
   const nPage=Math.ceil(parseInt(nitems)/limit);
   const list = await recipesService.getAllBriefRecipe({
      email, offset, limit
   })
   const url=`/profile/sharedrecipe?email=${email}`
   res.render("vwProfile/sharedRecipe", {
      layout: 'profile',
      nPage,
      page:p,
      url,
      list,
      isEmpty: list.length===0
   });
})
Router.get('/favorite',async(req,res,next)=>{
   const page=parseInt(req.query.p)||1
   const limit=3
   const offset=(page-1)*limit
   const email=req.query.email
   const nitems=await recipesService.CountFavoriteRecipe(email)
   const nPage=Math.ceil(parseInt(nitems)/limit);
   
   const favRecipeList=await recipesService.getFavoriteRecipes(email,offset,limit)
   var recipeList=[favRecipeList.length]
   for(var i=0;i<favRecipeList.length;i++){
      recipeList[i]=await recipesService.getRecipe(favRecipeList[i].recipeID)
      recipeList[i].numLikes=await recipesService.countLike(recipeList[i].id)
   }
   const url=`/profile/favorite?email=${email}`
   res.render("vwProfile/favoriteRecipe",{
      layout: 'profile',
      list:recipeList,
      nPage,
      page,
      url,
      isEmpty:favRecipeList.length===0
   })
})
Router.post('/favorite/remove',async(req,res,next)=>{
   const email=req.query.email
   const recipeID=req.query.recipeID
   const result= await recipesService.removeFavorite(email,recipeID)
   res.redirect(`/profile/favorite?email=${email}`)
})
Router.get('/follows',async(req,res,next)=>{
   const email=req.query.email
   const page=parseInt(req.query.p)||1
   const limit=5
   const offset=(page-1)*limit
   const nfollows=await usersService.CountFollowingUser(email)
   const list=await usersService.GetFollowingUser(email,offset,limit)
   
   const followList=[list.length]
   for(var i=0;i<list.length;i++){
      followList[i]=await usersService.findUserByEmail(list[i].followedUser)
   }
   const nPage=Math.ceil(parseInt(nfollows)/limit)
   const url=`/profile/follows?email=${email}`
   res.render('vwProfile/follows',{
      layout: 'profile',
      list:followList,
      nPage,
      page,
      url,
      isEmpty:list.length===0
   })
})
Router.get('/',async(req,res,next)=>{
   const list=await recipesService.getRecipesByUserEmail(req.query.email)
   const user=await usersService.findUserByEmail(req.query.email)
   const followed=  await usersService.isFollow(res.locals.auth.email,req.query.email)
   const follownumber=await usersService.countFolloweduser(req.query.email)
   let isOwn = false
   if(req.query.email == res.locals.auth.email)
      isOwn = true
   res.render("vwProfile/userProfile",{
      list,
      user,
      isFollowed:followed.length===1,
      isEmpty:list.length===0,
      follownumber,
      isOwn
   });
})


Router.get('/edit-account', async (req,res,next) =>{
   var user = await usersService.getUserByEmail(res.locals.auth.email);
   user = user[0];
   var isEmail = false;
   if(user.password == "") isEmail = true;
   res.render('vwProfile/account',{
      layout:'profile',
      user,isEmail
   });
})

Router.post("/edit-account",uploadAvatarEdit.fields([{name:"avatar"},{name:"cover"}]),async(req,res,next)=>{
   let email = req.cookies.user.email;
   const test = await usersService.getUserByEmail(email);
   var avatarLoaded = test[0].avatar;
   var coverLoaded = test[0].cover;
   var isEmail = false;
   if(test[0].password == "") isEmail = true;
   var hashedPassword = ""
   // if(test[0].password != ""){
   //    if(req.body.password != "********")
   //       hashedPassword = await bcrypt.hash(req.body.password, 5);
   //    else hashedPassword = test[0].password;
   // }
   if(req.avatarAdded) avatarLoaded = '/public/images/users/avatar/' + email + '.jpg'
   if(req.coverAdded) coverLoaded = '/public/images/users/cover/' + email + '.jpg'
   let user = {
      fullname: req.cookies.user.fullname || "",
      // password: hashedPassword || "",
      email: email,
      avatar: avatarLoaded,
      cover: coverLoaded,
      // role: req.session.passport.user.role,
      // isbaned: req.session.passport.user.isbaned,
      // otp: req.session.passport.user.otp,
   };
   let result = await usersService.updateInfo(
      email,
      user
   );
   req.cookies.user.avatar = user.avatar;
   req.cookies.user.cover = user.cover;
   if(req.session.passport){ 
      req.session.passport.user.avatar = user.avatar;
      req.session.passport.user.cover = user.cover;
   }
   res.cookie("user",req.cookies.user);
   return res.render('vwProfile/account',{
      layout:'profile',
      isAlert : true,
      icon: 'success',
      user,isEmail,
      title: 'Update account success',
   })
})

Router.post("/follow",async(req,res,next)=>{
   const follower=req.query.follower
   const followedUser=req.query.followedUser
   const result=await usersService.followUser(follower,followedUser)
   
   res.redirect('back');
})
Router.post("/unfollow",async(req,res,next)=>{
   const follower=req.query.follower
   const followedUser=req.query.followedUser
   const result=await usersService.unFollow(follower,followedUser)
   
   res.redirect('back');
})
Router.post("/report",async(req,res,next)=>{
   const userReported=req.query.userReported
   
   
   const result=await usersService.reportUser(req.body.reportedEmail,req.body.reason,userReported)
   res.redirect('back')
})
Router.post('/change-name', async(req,res,next) => {
   const newName = req.body.name;
   var user = await usersService.getUserByEmail(res.locals.auth.email);
   user = user[0];
   var isEmail = false;
   if(user.password == "") isEmail = true;
   const resultChange = await usersService.changeName(res.locals.auth.email, newName);
   req.cookies.user.fullname = newName;
   if(req.session.passport) req.session.passport.user = req.cookies.user;
   res.cookie("user", req.cookies.user);
   return res.render('vwProfile/account',{
       layout: 'profile',
       isAlert: true,
       icon: 'success',
       title: 'Name changed successfully.',
       user,isEmail
   })
}),
Router.post('/change-password',async (req, res, next)=>{
   var user = await usersService.getUserByEmail(res.locals.auth.email);
   user = user[0];
   var isEmail = false;
   const password = req.body.password;
   const hashedPassword = await bcrypt.hash(password,5);
   const resultChange = await usersService.changePassword(res.locals.auth.email, hashedPassword);
   return res.render('vwProfile/account',{
       layout: 'profile', 
       isAlert: true,
       icon: 'success',
       title: 'Password changed successfully.',
       user,isEmail
   })
})
export default Router;
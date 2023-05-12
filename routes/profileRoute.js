import express, { query, request } from 'express'
import multer from 'multer';
import fs from "fs"
import recipesService from '../service/recipesService.js';
import usersService from '../service/usersService.js'
import bcrypt from 'bcrypt'

import middlewares from '../middlewares/middlewares.js';
import { log } from 'console';


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
Router.get('/:email',async(req,res,next)=>{

   const list=await recipesService.getRecipesByUserEmail(req.params.email)
   const user=await usersService.findUserByEmail(req.params.email)
   const followed=  await usersService.isFollow(res.locals.auth.email,req.params.email)
   console.log(res.locals.auth.email);
   console.log(req.params.email);
   console.log(followed);
   res.render("vwProfile/userProfile",{
      list,
      user,
      isFollowed:followed.length===1
   });
})


Router.get('/edit-account', async (req,res,next) =>{
   var user = await usersService.getUserByEmail(res.locals.auth.email);
   user = user[0];
   var isEmail = false;
   if(user.password == "") isEmail = true;
   const email = user.email;
   res.render('vwProfile/account',{
      user,email,isEmail
   });
})

Router.post("/edit-account",uploadAvatarEdit.fields([{name:"avatar"},{name:"cover"}]),async(req,res,next)=>{
   let email = req.cookies.user.email;
   const test = await usersService.getUserByEmail(email);
   var isEmail = false;
   if(test[0].password == "") isEmail = true;
   var hashedPassword = ""
   if(test[0].password != ""){
      if(req.body.password != "********")
         hashedPassword = await bcrypt.hash(req.body.password, 5);
      else hashedPassword = test[0].password;
   }
   var avatarLoaded = test[0].avatar
   if(req.avatarAdded) avatarLoaded = '/public/images/users/avatar/' + email + '.jpg'
   var coverLoaded = test[0].cover
   if(req.coverAdded) coverLoaded = '/public/images/users/cover/' + email + '.jpg'
   let user = {
      fullname: req.body.fullname || "",
      password: hashedPassword || "",
      email: email,
      avatar: avatarLoaded,
      cover: coverLoaded,
   };
   let result = await usersService.updateInfo(
      email,
      user
   );
   return res.render('vwProfile/account',{
      isAlert : true,
      icon: 'success',
      user,email,isEmail,
      title: 'Update account success'
   })
})

Router.post("/follow",async(req,res,next)=>{
   const follower=req.query.follower
   const followedUser=req.query.followedUser
   const result=await usersService.followUser(follower,followedUser)
   console.log(result);
   res.redirect(`/profile/${followedUser}`)
})
Router.post("/unfollow",async(req,res,next)=>{
   const follower=req.query.follower
   const followedUser=req.query.followedUser
   const result=await usersService.unFollow(follower,followedUser)
   console.log(result);
   res.redirect(`/profile/${followedUser}`)
})

export default Router;
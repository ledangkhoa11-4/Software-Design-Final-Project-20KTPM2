import express, { query, request } from 'express'
import multer from 'multer';
import fs from "fs"
import recipesService from '../service/recipesService.js';
import usersService from '../service/usersService.js'
import bcrypt from 'bcrypt'

const Router = express.Router();
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
  const list=await recipesService.getAllRecipe()
  console.log(list);
   
   res.render("vwProfile/sharedRecipe", {
      list,
      isEmpty: list.length===0
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

export default Router;
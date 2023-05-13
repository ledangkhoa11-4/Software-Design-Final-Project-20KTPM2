import express, { query, request } from 'express'
import fs from "fs"
import recipesService from '../service/recipesService.js';
import usersService from '../service/usersService.js'
import bcrypt from 'bcrypt'

import middlewares from '../middlewares/middlewares.js';



const Router = express.Router();
Router.get('/reported-user',async (req,res,next)=>{
    const page=parseInt(req.query.p)||1;
    const limit=5
    const offset=(page-1)*limit
    
    const url=`/admin/reported-user?role=0`
    const nitems=await usersService.countReprtedUser();
    const nPage=Math.ceil(parseInt(nitems)/limit)
    const list=await usersService.getReportedUser(offset,limit);
    console.log(list);

    res.render("vwAdmin/reportedUser",{
        layout:'admin',
        list,
        nPage,
        page,
        url,
        isEmpty:list.length===0

    })
})

export default Router;
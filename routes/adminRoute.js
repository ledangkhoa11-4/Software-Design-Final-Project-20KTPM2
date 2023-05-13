import express, { query, request } from 'express'
import fs from "fs"
import recipesService from '../service/recipesService.js';
import usersService from '../service/usersService.js'
import bcrypt from 'bcrypt'

import middlewares from '../middlewares/middlewares.js';



const Router = express.Router();
Router.use(middlewares.isAdmin);
Router.get('/reported-user',async (req,res,next)=>{
    const page=parseInt(req.query.p)||1;
    const limit=2
    const offset=(page-1)*limit
    const email=req.query.email
    const url=`/admin/reported-user?role=0`
    const nitems=await usersService.countReprtedUser(email);
    const nPage=Math.ceil(parseInt(nitems)/limit)
    const list=await usersService.getReportedUser(email,offset,limit);
    

    res.render("vwAdmin/reportedUser",{
        layout:'admin',
        list,
        nPage,
        page,
        url,
        isEmpty:list.length===0

    })
})
Router.get('/accounts', async (req,res)=>{
    const page = req.query.p || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    let list = await usersService.getUsersByPage(limit,offset);
    let totalUser = await usersService.getUsersAmount();
    let url = '/admin/accounts?';

    let nPage=Math.ceil(totalUser/limit);
    res.render('vwAdmin/accounts',{
    layout:'admin',
    showFilter:true,
    list,
    isEmpty: list.length===0,
    nPage,
    page,
    url,
    })
})

Router.post('/accounts/disabled', async(req,res)=>{
    const status=req.body.status;
    const Email=req.query.email
    if(status==='disable'){
        const ret=await usersService.disabledUser(Email,1);
    }
    else{
        const ret=await usersService.disabledUser(Email,0)
    }
    res.redirect('back')
})

export default Router;
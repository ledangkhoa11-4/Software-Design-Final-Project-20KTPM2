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
Router.get('/accounts', async (req,res)=>{
    const page = req.query.p || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const reported = req.query.reported || 0;
    const baned = req.query.baned || 0;
    let list; 
    let totalUser;
    let url; 
    if(reported == baned){
        list = await usersService.getUsersByPage(limit,offset);
        totalUser  = await usersService.getUsersAmount();
        url = '/admin/accounts?';
    }else{
        if(reported == 1){
            list = await usersService.getReportedUsersByPage(limit,offset);        
            totalUser = await usersService.getReportedUsersAmount();
            url = '/admin/accounts?reported=1';
        }
        if(baned == 1){
            list = await usersService.getBanedUsersByPage(limit,offset);        
            totalUser = await usersService.getBanedUsersAmount();
            url = '/admin/accounts?baned=1';
        }
    }
    for(let i in list){
        list[i].reportedTimes = await usersService.getReportedTimes(list[i].email);
    }
    let nPage=Math.ceil(totalUser/limit);
    res.render('vwAdmin/accounts',{
    layout:'admin',
    showFilter:true,
    list,
    isEmpty: list.length===0,
    nPage,
    page,
    url,
    reported,baned,
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

Router.post('/search',async (req,res,next)=>{
    const searchValue = req.query.name;
    const reported = req.query.reported || 0;
    const baned = req.query.baned || 0;
    const page = req.query.p || 1;
    const limit = 1;
    const offset = (page - 1) * limit;
    let list; 
    let totalUser;
    let url; 
    if(reported == baned){
        list = await usersService.getUsersSearchByPage(searchValue,limit,offset);
        totalUser = await usersService.getUsersSearchAmount(searchValue);
        url = `/admin/search?name=${searchValue}`
    }
    else{
        if(reported == 1){
            list = await usersService.getReportedUsersSearchByPage(searchValue,limit,offset);
            totalUser = await usersService.getReportedUserSearchAmount(searchValue);
            url = `/admin/search?name=${searchValue}&reported=1`;
        }
        if(baned == 1){
            list = await usersService.getBanedUsersSearchByPage(searchValue,limit,offset);
            totalUser = await usersService.getBanedUsersSearchAmount(searchValue);
            url = `/admin/search?name=${searchValue}&baned=1`;
        }
    }
    for(let i in list){
        list[i].reportedTimes = await usersService.getReportedTimes(list[i].email);
    }
    let nPage=Math.ceil(totalUser/limit);
    res.render('vwAdmin/accounts',{
        layout:'admin',
        showFilter:true,
        searchValue,
        list,
        isEmpty: list.length===0,
        nPage,
        page,
        url,
        reported,baned,
        })
})

Router.get('/search',async (req,res,next)=>{
    const searchValue = req.query.name;
    const reported = req.query.reported || 0;
    const baned = req.query.baned || 0;
    const page = req.query.p || 1;
    const limit = 1;
    const offset = (page - 1) * limit;
    let list; 
    let totalUser;
    let url; 
    if(reported == baned){
        list = await usersService.getUsersSearchByPage(searchValue,limit,offset);
        console.log(list);
        totalUser = await usersService.getUsersSearchAmount(searchValue);
        url = `/admin/search?name=${searchValue}`
    }
    else{
        if(reported == 1){
            list = await usersService.getReportedUsersSearchByPage(searchValue,limit,offset);
            totalUser = await usersService.getReportedUserSearchAmount(searchValue);
            url = `/admin/search?name=${searchValue}&reported=1`;
        }
        if(baned == 1){
            list = await usersService.getBanedUsersSearchByPage(searchValue,limit,offset);
            totalUser = await usersService.getBanedUsersSearchAmount(searchValue);
            url = `/admin/search?name=${searchValue}&baned=1`;
        }
    }
    for(let i in list){
        list[i].reportedTimes = await usersService.getReportedTimes(list[i].email);
    }
    let nPage=Math.ceil(totalUser/limit);
    res.render('vwAdmin/accounts',{
        layout:'admin',
        showFilter:true,
        searchValue,
        list,
        isEmpty: list.length===0,
        nPage,
        page,
        url,
        reported,baned,
        })
})

export default Router;
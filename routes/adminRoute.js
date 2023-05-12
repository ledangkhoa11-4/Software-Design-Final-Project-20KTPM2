import express from 'express'
import middleware from '../middlewares/middlewares.js';
import usersService from '../service/usersService.js';

const Router = express.Router();
Router.use(middleware.isAdmin);

Router.get('/accounts', async (req,res)=>{
    const page = req.query.p || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    let list = await usersService.getUsersByPage(limit,offset);
    let totalUser = await usersService.getUsersAmount();
    let url = '/admin/accounts?';

    let nPage=Math.ceil(totalUser/limit);
    res.render('vwAdmin/accounts',{
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

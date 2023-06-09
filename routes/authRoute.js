import express from 'express'
import userService from '../service/usersService.js'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer';
import passport from 'passport';


var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'forbusiness0868282427@gmail.com',
      pass: 'ihhumuseaajqdkez'
    }
  });

const Router = express.Router();
Router.get('/register',async (req,res, next)=>{
    res.render('vwAuth/register');  
})
Router.get('/login',(req,res, next)=>{
    let isAlert = req.query.error;
    let alertTitle = {isAlert: false,};
    if(isAlert == 1){
      alertTitle = {
        isAlert: true,
        msg: "Username or Password incorrect. Please type again!"
      }
    }
    if(isAlert == 2){
      alertTitle = {
        isAlert: true,
        msg: "Your account was suspended. Please contact to admin!"
      }
    }
    res.render('vwAuth/login',{
      alertTitle
    });
})
Router.get('/logout',(req,res, next)=>{
    res.clearCookie("user");
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
})

Router.post("/login",async (req, res, next)=>{
    const user = req.body;
    let userCheck = await userService.getUserByEmail(user.email);
    if (userCheck.length == 0)
        return res.redirect("/auth/login?error=1")
    const hashedPassword = userCheck[0].password;
    const checkPsw = await bcrypt.compare(user.password, hashedPassword);
    if(!checkPsw)
      return res.redirect("/auth/login?error=1")
    if(user.otp){
      const otp = user.otp[0] + user.otp[1] + user.otp[2] + user.otp[3];
      await userService.verified(user.email, otp);
    }
    const verified = await userService.isVerified(user.email);
    res.locals.admin=userCheck[0];
    if(verified)
      return next();
    res.locals.temp = user;
    res.render('vwAuth/inputOtp',{
      email: user.email,
      password: user.password
    })
  }, passport.authenticate('local',{ failureRedirect: '/auth/login?error=1'}), (req,res)=>{
    if(req.session.passport.user.isbaned == 1){
      return res.redirect('/auth/login?error=2');
    }
   if(res.locals.admin.role===0){
      res.redirect("/admin/accounts");
   }
   else{
    res.redirect("/");
   }
});

Router.post('/register',async (req,res, next)=>{
    const user = req.body;
    const OTP =  Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const hashedPassword = await bcrypt.hash(user.password, 5);
    const result = await userService.addUser({
        FullName: user.name,
        Email: user.email,
        Password: hashedPassword,
        Role: 2,
        OTP: OTP,
        avatar: '/public/images/users/avatar/undifine.jpg',
        cover: '/public/images/users/cover/undifine.jpg',
    })
    var mailOptions = {
      from: 'Cookery@gmail.com',
      to: user.email,
      subject: 'Shh, don\'t share this OTP with anyone' ,
      html: `
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Cookery</a>
    </div>
    <p style="font-size:1.1em">Hi, ${user.name}</p>
    <p>Thank you for choosing Cookery. Use the following OTP to complete your Sign Up procedures. If you cannot see mail in your inbox, please check junk box, it may be in here. Sorry for the inconvenience</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Cookery</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Cookery Inc</p>
      <p>227 Nguyen Van Cu Ho Chi Minh City</p>
      <p>Viet Nam</p>
    </div>
  </div>
</div>
      `
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      }
    });

    res.render('vwAuth/register',{
        isAlert : true,
        icon: 'success',
        title: 'Check your email to validation'
    });
})

Router.get('/google', passport.authenticate('google',{scope:['profile','email']}));
Router.get('/google/callback',
  passport.authenticate('google', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});
Router.post('/check-exists-email', async (req, res)=>{
  const email = req.body.email;
  let exists = await userService.isEmailExists(email); 
  res.json({exists});
});
Router.post('/check-current-name', async (req, res) =>{
    const name = req.body.name;
    const email = req.body.email;
    let exists = await userService.isNameExists(email, name);
    res.json({exists});
})
Router.post('/check-valid-pass', async (req, res)=>{
  const password = req.body.password;
  const user = await userService.findUserByEmail(res.locals.auth.email);
  console.log(user);
  let isValid = await bcrypt.compare(password, user.password);
  res.json({isValid});
});
Router.post('/check-current-email', async (req, res)=>{
  const email = req.body.email;
  let exists = false;
  if(email == res.locals.auth.email){
    res.json({exists})
  }
  else{
    exists = await userService.isEmailExists(email); 
    res.json({exists});
  }
});
export default Router;
  
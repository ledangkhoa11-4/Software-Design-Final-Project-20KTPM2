import localStrategy from 'passport-local';
import userService from '../service/usersService.js';
import bcrypt from 'bcrypt'
import googleStrategy from 'passport-google-oauth20'

const GoogleStrategy = googleStrategy.Strategy;
const LocalStrategy = localStrategy.Strategy;
export default function (passport, strategy){
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, async (req, email, password, done)=>{
    let user = await userService.getUserByEmail(email);
    if (user.length == 0)
      return done(null, false);
    if(user[0].disable == 1){
      return done(null, {status: 'disabled'});
    }
    const hashedPassword = user[0].password;
    const verify = await bcrypt.compare(password, hashedPassword);
    if(verify){
      delete user[0].Bio;
      delete user[0].Password;
      return done(null, user[0])
    }
      
    return done(null, false)
  }))


  passport.use(new GoogleStrategy({
    clientID: process.env.google_key,
    clientSecret: process.env.google_secret,
    callbackURL: process.env.callback_google_url,
    profileFields: ['profile','email']
    },
    function(accessToken, refreshToken, profile, done) {
      let email = profile.emails[0].value;
      let id = profile.id;
      let name = profile._json.name;
      const userDat = {
        fullname: name,
        email: email,
        password: "",
        role: 2,
        otp: 0,
        avatar:'/public/images/users/avatar/undifine.jpg',
        cover:'/public/images/users/cover/undifine.jpg',
      }
      process.nextTick(async function () {
        const user = await userService.getUserByEmail(email);
       
        // user chưa tồn tại -> Tạo user mới
        if(user.length == 0){
          const result = await userService.addUser(userDat)
          userDat.IDUser = result
        }else{
          if(user[0].isbaned == 1){
            return done(null, {status: 'disabled'});
          }
        }
        if(userDat.fullname != user[0].fullname) userDat.fullname = user[0].fullname;
        delete userDat.password;
        return done(null, userDat);
      });
    }
  ));
}




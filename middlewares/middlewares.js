export default {
    isLogged: (req, res, next) => {
      if (res.locals.auth) {
        next()
      } else {
        return res.redirect("/auth/login");
      }
    },
   
  };
  
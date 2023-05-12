import recipesService from "../service/recipesService.js";
export default {
    isLogged: (req, res, next) => {
      if (res.locals.auth) {
        next()
      } else {
        return res.redirect("/auth/login");
      }
    },
    isOwnRecipe: async (req, res, next) => {
      let recipeID = req.params.id
      const recipe = await recipesService.getRecipe(recipeID)
      if (res.locals.auth) {
        if(res.locals.auth.email == recipe.poster) 
          next()
        else next(err)
      } else {
        return res.redirect("/auth/login");
      }
    },
    isAdmin: (req, res, next) => {
      if (res.locals.auth) {
        if (res.locals.auth.role == 0) return next();
        res.status(403).render("404", { layout: false });
      } else {
        return res.redirect("/auth/login");
      }
    },
  };
  
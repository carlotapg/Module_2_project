const express = require("express");
const privateRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user-model");
const Recipe = require("../models/recipe-model");
const bodyParser = require("body-parser");
const zxcvbn = require("zxcvbn");

//custom middleware
function loggedIn(req, res, next) {
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect("/");
  }
}

//GET /PRIVATE/PROFILE renders personal profile view

privateRouter.get("/myprofile", loggedIn, (req, res, next) => {
  const id = req.session.currentUser._id;
  User.findById(id)
    .then((thisUser) => {
      const data = { thisUser: thisUser };
      res.render("myprofile", data);
    })
    .catch((err) => {
      console.log(err);
      next();
    });
});

//GET /PRIVATE/MYPROFILE/EDIT renders edit-profile view
privateRouter.get("/myprofile/edit/:id", loggedIn, (req, res, next) => {
  const id = req.session.currentUser._id;
  User.findById(id)
    .then((thisUser) => {
      const data = { thisUser: thisUser };
      res.render("edit-profile", data);
    })
    .catch((err) => {
      console.log(err);
      next();
    });
});

//POST /PRIVATE/MYPROFILE/EDIT sends new data to the server. Renders same page updated

privateRouter.post("/myprofile/edit/:id", loggedIn, (req, res, next) => {
  const id = req.session.currentUser._id;
  const { username, email, password, imageURL } = req.body;

  User.findByIdAndUpdate(
    id,
    { username, email, password, imageURL },
    { new: true }
  )
    .then((updated) => {
      res.redirect("/private/myprofile");
    })
    .catch((err) => console.log(err));
});

//GET /PRIVATE/FAVORITES renders favorites and my recipes view
//FAVORITES NOT WORKING

privateRouter.get("/favorites", loggedIn, function (req, res, next) {
  const id = req.session.currentUser._id;
  User.findById(id)
    .populate("myRecipes")
    .then((thisUser) => {
      //console.log(thisUser);
      const mineArr = { created: thisUser.myRecipes };
      const favArr = { faved: thisUser.favorites };

      res.render("favorites", mineArr);
    });
});

//GET /PRIVATE/FAVORITES/CREATE adds new recipe
privateRouter.get("/favorites/create", loggedIn, function (req, res, next) {
  res.render("create");
});

//POST /PRIVATE/FAVORITES/CREATE adds new recipe
privateRouter.post("/favorites/create", loggedIn, (req, res, next) => {
  /*const {
    name,
    imageURL,
    ingredients,
    "ingredients.quantity": ingredientsQuantity,
    instructions,
  } = req.body;*/

  const {
    name,
    imageURL,
    instructions,
    ingredientName,
    quantity,
    type,
  } = req.body;

  const ingredientObj = {
    name: ingredientName,
    quantity: quantity,
    type: type,
  }



  let thisUser = req.session.currentUser._id;
  Recipe.create({
    name,
    imageURL,
    instructions,
    ingredients: [ ingredientObj ]
  })
  
    .then((newRecipe) => {
      User.findByIdAndUpdate(
        thisUser,
        { $push: { myRecipes: newRecipe._id } },
        { new: true }
      )
        //.populate("newRecipe")
        .then((thisUser) => {
          res.redirect(`/recipes`);
          res.render("favorites");
        });
    })
    .catch((err) => console.log(err));
});

//POST /PRIVATE/FAVORITES/:ID deletes existing favorite recipe

//POST /PRIVATE/FAVORITES/:ID/ADD delete selected myrecipe


//POST /PRIVATE/MYRECIPES/ADD Adds a new recipe to favorites and renders favorites updated view

privateRouter.post("/favorites/:recipeId/add", function (req, res, next) {

  const id = req.session.currentUser._id;
  
    const { recipeId } = req.params;
    
        User.findByIdAndUpdate(id,
            { $push: { favorites: recipeId } }  )
            .populate("favorites")
           
            .then(()=> recipeId.save)

            .then(() =>
            res.redirect("/private/favorites"))
           
        });




module.exports = privateRouter;

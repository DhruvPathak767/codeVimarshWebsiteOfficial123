const Home = require("../models/home");
const Favourites = require("../models/favourites");

exports.getIndex = (req, res, next) => {
  Home.fetchAll((registeredHomes) =>
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
    })
  );
};

exports.getHomes = (req, res, next) => {
  Home.fetchAll((registeredHomes) =>
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
    })
  );
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
  })
};

exports.getFavouriteList = (req, res, next) => {
  Favourites.getFavourtes((favourites) => {
    Home.fetchAll((registeredHomes) => {
      const favourtehomes = registeredHomes.filter(home => favourites.includes(home.id));
      res.render("store/favourite-list", {
        registeredHomes: favourtehomes,
        pageTitle: "My Favourites",
        currentPage: "favourites",
      });
    });
  }); // ← This closing brace is missing!
};
exports.postFavourites = (req, res, next) => {
  console.log(req.body);
  Favourites.addToFavourites(req.body.homeId,(err)=>{
    if(err){
      res.send(err);
    }
    else{
        res.redirect("/favourites");
    }
  });

};
exports.removeFavourites = (req, res, next) => {
  const homeId = req.params.homeId;
  Favourites.removeFromFavourites(homeId);
  res.redirect("/favourites");
};
exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId; // assuming route is /homes/:homeId
  Home.findById(homeId, (homeDetails) => {
    if(!homeDetails)
    {
      return res.status(404).render("404", {
        pageTitle: "Home Not Found",
        currentPage: "",
      });
    }
    else{
 res.render("store/home-detail", {
      pageTitle: "Home Details",
      home: homeDetails,
      currentPage: "homes",
    });
    }
   
  });
};
 
  


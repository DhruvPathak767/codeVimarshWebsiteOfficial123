const Home = require("../models/home");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    home: {},
    homeId: null,
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.fetchAll((registeredHomes) =>
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      editing: false
    })
  );
};
exports.getEditHomes= (req, res, next) => {
  const homeId = req.params.homeId;
  const editMode = req.query.edit==='true';
  if (!editMode) {
    return res.redirect("/");
  }
  Home.findById(homeId, home => {
    if (!home) {
      return res.redirect("/");
    }
 res.render("host/edit-home", {
    pageTitle: "edit home",
    currentPage: "addHome",
    editing: editMode,
    homeId: homeId,
    home:home
  });
});

}

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, photoUrl } = req.body;
  const home = new Home(houseName, price, location, rating, photoUrl);
  home.save();

  res.render("host/home-added", {
    pageTitle: "Home Added Successfully",
    currentPage: "homeAdded",
  });
};
exports.postEditHomes = (req, res, next) => {
  const { homeId, houseName, price, location, rating, photoUrl } = req.body;
    const home = new Home(houseName, price, location, rating, photoUrl);
    home.id=homeId;
  home.save();

  res.redirect("/host/host-home-list");
};
exports.postDeleteHome=(req,res,next)=>{
  const homeId=req.params.homeId;
  Home.deleteById(homeId,error=>{
    if(error)
    {
      console.log("Error deleting home:",error);

    }
    res.redirect("/host/host-home-list");
  });


};
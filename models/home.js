// Core Modules
const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/pathUtil");
const Favourites = require("./favourites");

module.exports = class Home {
  constructor(houseName, price, location, rating, photoUrl) {
    this.houseName = houseName;
    this.price = price;
    this.location = location;
    this.rating = rating;
    this.photoUrl = photoUrl;
  }

  save() {


    Home.fetchAll((registeredHomes) => {
      if(this.id)
      {
        registeredHomes=registeredHomes.map(home=>{
          if(home.id===this.id)
          {
            return this;
          }
          return home;
        })
      }
      else{
            this.id=Date.now().toString();
               registeredHomes.push(this);
      }
   
      const homeDataPath = path.join(rootDir, "data", "homes.json");
      fs.writeFile(homeDataPath, JSON.stringify(registeredHomes), (error) => {
        console.log("File Writing Concluded", error);
      });
    });
  }

  static fetchAll(callback) {
    const homeDataPath = path.join(rootDir, "data", "homes.json");
    fs.readFile(homeDataPath, (err, data) => {
      callback(!err ? JSON.parse(data) : []);
    });
  }
   static findById(id, callback) {
    Home.fetchAll((registeredHomes) => {
    const home = registeredHomes.find(h => h.id === id);
    callback(home);
    });
  }
  static deleteById(id,callback)
  {
    Home.fetchAll(registeredHomes=>{
      const updatedHomes=registeredHomes.filter(home=>home.id!==id);
      const homeDataPath = path.join(rootDir, "data", "homes.json");
      fs.writeFile(homeDataPath, JSON.stringify(updatedHomes), (error) => {
        if(error)
        {
          return callback(error);
        }
        Favourites.removeFromFavourites(id);
      });
    });
  }
};


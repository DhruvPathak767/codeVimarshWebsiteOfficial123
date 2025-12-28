// Core Modules
const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/pathUtil");

module.exports = class Favourites {

  static addToFavourites(homeId,callback) {
   
    Favourites.getFavourtes((favourites) => {
      if(!favourites.includes(homeId)){
        favourites.push(homeId);
            const favDataPath = path.join(rootDir, "data", "favourites.json");
      fs.writeFile(favDataPath, JSON.stringify(favourites), callback);
      }
      else{
        return callback("Already in Favourites");
      }
   
  
    });
  }

  static getFavourtes(callback) {
    const favDataPath = path.join(rootDir, "data", "favourites.json");
    fs.readFile(favDataPath, (err, data) => {
      callback(!err ? JSON.parse(data) : []);
    });
  }
  static removeFromFavourites(homeId) {
    Favourites.getFavourtes((favourites) => {
      const updatedFavourites = favourites.filter(id => id !== homeId);
      const favDataPath = path.join(rootDir, "data", "favourites.json");
      fs.writeFile(favDataPath, JSON.stringify(updatedFavourites), (err) => {
        if (err) {
          console.log("Error removing from favourites:", err);
        }
      });
    });
  }
}

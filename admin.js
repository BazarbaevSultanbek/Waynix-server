const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");

const Hotel = require("./models/hotel-model");
const User = require("./models/user-model");

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
  resources: [
    {
      resource: Hotel,
      options: {
        listProperties: ["name", "location", "price", "rating"],
        filterProperties: ["name", "location", "rating"],
        editProperties: ["name", "description", "location", "price", "rating", "image", "phone"],
      },
    },
    {
      resource: User,
      options: {
        listProperties: [
          "name",
          "email",
          "phone_number",
          "role",
          "isActive",
          "isGit",
          "createdAt",
        ],
        filterProperties: [
          "name",
          "email",
          "phone_number",
          "role",
          "isActive",
          "location",
          "language",
          "createdAt",
        ],
        showProperties: [
          "_id",
          "name",
          "email",
          "phone_number",
          "avatar",
          "role",
          "isActive",
          "isGit",
          "bio",
          "location",
          "language",
          "socials.instagram",
          "socials.telegram",
          "socials.linkedin",
          "socials.email",
          "stats.placesCount",
          "stats.savedCount",
          "stats.commentsCount",
          "stats.avgRating",
          "likedPlaces",
          "visitedPlaces",
          "bookedPlaces",
          "friends",
          "requests",
          "waiting",
          "createdAt",
          "updatedAt",
        ],
        editProperties: [
          "name",
          "email",
          "phone_number",
          "avatar",
          "role",
          "isActive",
          "isGit",
          "bio",
          "location",
          "language",
          "socials.instagram",
          "socials.telegram",
          "socials.linkedin",
          "socials.email",
          "stats.placesCount",
          "stats.savedCount",
          "stats.commentsCount",
          "stats.avgRating",
          "likedPlaces",
          "visitedPlaces",
          "bookedPlaces",
          "friends",
          "requests",
          "waiting",
        ],
        properties: {
          password: { isVisible: false },
          activationLink: { isVisible: false },
        },
      },
    },
  ],
  rootPath: "/admin",
});

const router = AdminJSExpress.buildRouter(adminJs);
module.exports = { adminJs, router };

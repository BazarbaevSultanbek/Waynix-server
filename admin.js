const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose"); // 👈 IMPORTANT
const mongoose = require("mongoose");

// Import your models
const Hotel = require("./models/hotel-model");
const User = require("./models/user-model");

// Register adapter
AdminJS.registerAdapter(AdminJSMongoose);

// Initialize AdminJS
const adminJs = new AdminJS({
  resources: [
    {
      resource: Hotel,
      options: {
        listProperties: ["name", "location", "price", "rating"],
        editProperties: [
          "name",
          "description",
          "location",
          "price",
          "rating",
          "image",
          "phone",
        ],
        filterProperties: ["name", "location"],
      },
    },
    {
      resource: User,
      options: {
        listProperties: ["name", "email", "phone_number"],
        editProperties: ["name", "email", "phone_number", "avatar"],
      },
    },
  ],
  rootPath: "/admin",
});

// Build router
const router = AdminJSExpress.buildRouter(adminJs);

module.exports = { adminJs, router };

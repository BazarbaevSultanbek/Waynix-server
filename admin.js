const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");

const User = require("./models/user-model");

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: {
        listProperties: [
          "name",
          "email",
          "role",
          "emailVerified",
          "newsletterSubscribed",
          "createdAt",
        ],
        filterProperties: [
          "name",
          "email",
          "role",
          "emailVerified",
          "location",
          "settings.language",
          "createdAt",
        ],
        showProperties: [
          "_id",
          "name",
          "email",
          "password",
          "phone_number",
          "avatar",
          "role",
          "emailVerified",
          "newsletterSubscribed",
          "isActive",
          "bio",
          "location",
          "socials.instagram",
          "socials.telegram",
          "socials.facebook",
          "socials.linkedin",
          "socials.website",
          "settings.language",
          "settings.fontSize",
          "settings.notifications.newPlaces",
          "settings.notifications.comments",
          "settings.notifications.messages",
          "visitedPlaces",
          "savedPlaces",
          "comments",
          "joinedAt",
          "createdAt",
          "updatedAt",
        ],
        editProperties: [
          "name",
          "email",
          "password",
          "phone_number",
          "avatar",
          "role",
          "emailVerified",
          "newsletterSubscribed",
          "isActive",
          "bio",
          "location",
          "socials.instagram",
          "socials.telegram",
          "socials.facebook",
          "socials.linkedin",
          "socials.website",
          "settings.language",
          "settings.fontSize",
          "settings.notifications.newPlaces",
          "settings.notifications.comments",
          "settings.notifications.messages",
          "visitedPlaces",
          "savedPlaces",
          "comments",
        ],
      },
    },
  ],
  rootPath: "/admin",
});

const router = AdminJSExpress.buildRouter(adminJs);
module.exports = { adminJs, router };

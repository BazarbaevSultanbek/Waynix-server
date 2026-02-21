module.exports = class UserDto {
  id;
  name;
  email;
  phone_number;
  avatar;
  bio;
  location;
  joinedAt;
  socials;
  visitedPlaces;
  savedPlaces;
  comments;
  settings;
  isActive;
  isGit;

  constructor(model) {
    this.id = model._id;
    this.name = model.name;
    this.email = model.email;
    this.phone_number = model.phone_number;
    this.avatar = model.avatar;
    this.bio = model.bio;
    this.location = model.location;
    this.joinedAt = model.joinedAt;
    this.socials = model.socials;
    this.visitedPlaces = model.visitedPlaces || [];
    this.savedPlaces = model.savedPlaces || [];
    this.comments = model.comments || [];
    this.settings = model.settings;
    this.isActive = model.isActive;
    this.isGit = model.isGit;
  }
};

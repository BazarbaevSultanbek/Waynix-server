module.exports = class UserDto{
    email;
    id;
    isActivated;
    name;
    phone_number;
    avatar;
    constructor(modal) {
        this.email = modal.email;
        this.id = modal._id;
        this.isActivated = modal.isActivated;
        this.name = modal.name;
        this.phone_number = modal.phone_number;
        this.avatar = modal.avatar;
    }
}

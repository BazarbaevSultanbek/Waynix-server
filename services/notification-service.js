const UserModel = require("../models/user-model");

class NotificationService{
    async getNotifications(id){
        const user = await UserModel.findOne({_id: id});
        return user?.notifications;
    }

    async deleteNotification(id, notificationId){
        await UserModel.findByIdAndUpdate(id, {$pull:{notifications: {id: notificationId}}}, {new: true});
        const user = await UserModel.findOne({_id: id});
        return user.notifications;
    }
}

module.exports = new NotificationService();

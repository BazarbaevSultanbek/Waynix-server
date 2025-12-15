const NotificationService = require("../services/notification-service");


class notificationController {
   async getNotifications(req, res, next){
      try{
         const id = req.query.id;
         const notifications = await NotificationService.getNotifications(id);
         return res.json(notifications);
      }catch (e){
         next(e)
      }
   }

   async deleteNotification(req, res, next){
      try{
         const id = req.query.id;
         const notificationId = req.query.notificationId;
         const notifications = await NotificationService.deleteNotification(id, notificationId);
         return res.json(notifications);
      }catch (e){
         next(e)
      }
   }
}

module.exports = new notificationController();

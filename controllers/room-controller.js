

class roomController {
    async getNotifications(req, res, next){
        try{
            // const id = req.query.id;
            // const notifications = await NotificationService.getNotifications(id);
            // return res.json(notifications);
        }catch (e){
            next(e)
        }
    }

}

module.exports = new roomController();

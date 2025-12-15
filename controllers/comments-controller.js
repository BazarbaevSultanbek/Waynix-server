const commentsService = require("../services/comments-service");

class CommentsController{
    async addComment(req, res, next){
        try {
            const {user_id, post_id, text, likes} = req.body;
            const date = new Date().toString();
            const commentData = await commentsService.addComment(user_id, post_id, text, date, likes);
            return res.json(commentData);
        }catch (e){
            next(e);
        }
    }
    async getAllComments(req, res, next) {
        try {
            const comments = await commentsService.getAllComments();
            return res.json(comments);
        } catch (e) {
            next(e);
        }
    }

}

module.exports = new CommentsController();

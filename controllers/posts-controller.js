const postsService = require("../services/posts-service");
const UserModel = require("../models/user-model");
// const fileController = require("../controllers/file-controller");
const uuid = require("uuid");

class PostsController {
    async addPost(req, res, next) {
        try {
            const file = req.files.file;
            const user = await UserModel.findOne({_id: req.query.userId});
            const type = file.mimetype;
            const filePath = file.data;
            // const fileData = await fileController.uploadFile(filePath, file.name, type);
            const fileData = null;  // need to update here 
            // const publicURI = await fileController.generatePublicUrl(fileData.id);
            const publicURI = "https://4kwallpapers.com/images/wallpapers/makima-chainsaw-man-minimal-art-amoled-black-background-5k-5120x2880-8861.png"

            const pathToFile = publicURI.webContentLink;
            const {text} = req.body;
            const date = new Date().toString();
            const idFile = fileData.id;
            const postData = await postsService.addPost(text, date, type, idFile, pathToFile, user);
            res.json(postData)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Upload error"})
        }
    }
    async getAllPosts(req, res, next) {
        try {
            const posts = await postsService.getAllPosts();
            return res.json(posts);
        } catch (e) {
            next(e);
        }
    }


}

module.exports = new PostsController();

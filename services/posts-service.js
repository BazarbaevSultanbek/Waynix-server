const PostsModel = require("../models/posts-model");

class PostsService {
    async addPost(text, date, type, idFile, pathToFile, user) {
        const post = await PostsModel.create({text, date, type, idFile, pathToFile, user, likes: 0});
        return post;
    }

    async getAllPosts() {
        const result = await PostsModel.find({})
            .populate("user", "name")
            .exec()
            .then((posts) => {
                return posts;
            })
            .catch((err) => {
                console.error('Error querying posts:', err);
                return err;
            })

        return result;
    }

}

module.exports = new PostsService();

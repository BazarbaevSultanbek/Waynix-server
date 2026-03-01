const jwt = require("jsonwebtoken");
const tokenModal = require("../models/token-model");

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "waynix_access_secret_fallback";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "waynix_refresh_secret_fallback";

class TokenService{
    generateTokens(payload){
        const accessToken = jwt.sign(payload, ACCESS_SECRET, {expiresIn: "30m"})
        const refreshToken = jwt.sign(payload, REFRESH_SECRET, {expiresIn: "30d"})
        return{
            accessToken,
            refreshToken
        }
    }

    async validateAccessToken(token){
        try{
            const userData = jwt.verify(token, ACCESS_SECRET);
            return userData
        }catch (e){
            return null;
        }
    }

    async validateRefreshToken(token){
        try{
            const userData = jwt.verify(token, REFRESH_SECRET);
            return userData
        }catch (e){
            return null;
        }
    }

    async saveToken(userId, refreshToken){
        const tokenData = await tokenModal.findOne({user: userId})
        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        const token = await tokenModal.create({user: userId, refreshToken});
        return token;
    }

    async removeToken(refreshToken){
        const tokenData = await tokenModal.deleteOne({refreshToken});
        return tokenData;
    }

    async findToken(refreshToken){
        const tokenData = await tokenModal.findOne({refreshToken});
        return tokenData;
    }
}

module.exports = new TokenService();

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log("Middleware");
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token, proccess.env.JWT_KEY);
        req.userData = decode;
        next();
    }catch (error) {
        return res.status(401).json({
            message: "Token is invalid",
            token: decode
        });
    } 
}
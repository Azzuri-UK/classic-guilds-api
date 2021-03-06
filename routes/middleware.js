let jwt = require('jsonwebtoken');
const noAuth = [
    '/loot/recent',
    '/recruitment'

];
let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE")  {
                    if (decoded.user.role === "OFFICER"){
                        req.decoded = decoded;
                        next();
                    } else {
                        return res.json({
                            success: false,
                            message: 'You do not have permission to perform that action',
                            decoded: decoded
                        });
                    }
                } else {
                    req.decoded = decoded;
                    next();
                }

            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};

module.exports = {
    checkToken: checkToken
}
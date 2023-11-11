const jwt = require('jsonwebtoken');

const authenticateJwt = (roles = []) => (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.sendStatus(403);
            }

            if (roles.length === 0 || roles.includes(decoded.role)) {
                req.user = decoded;
                next();
            } else {
                res.status(403).json({ message: "You do not have permission to perform this action" });
            }
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = authenticateJwt;

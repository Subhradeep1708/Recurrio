import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.models.js";

export const authorize = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        console.log("Token: ",token);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized no token' })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        console.log(decoded);
        const user = await User.findById(decoded.userId)

        if (!user) return res.status(401).json({ message: 'Unauthorized no user' })

        // attatch the user to request and forword it 
        req.user = user
        next()

    } catch (error) {
        res.status(401).json({
            message: 'Unauthorized',
            error: error.message
        })
    }
}

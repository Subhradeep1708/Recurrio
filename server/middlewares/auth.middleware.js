import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import User from "../models/user.models";

export const authorize = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        console.log(token);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        console.log(decoded);
        const user = await User.findById(decoded.userId)

        if (!user) return res.status(401).json({ message: 'Unauthorized' })

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

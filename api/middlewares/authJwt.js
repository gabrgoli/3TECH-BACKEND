// Authorization
// verifica token (user registrado y logueado) y rol

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(403).json({ message: 'No token provided' })

        const decoded = jwt.verify(token,  'secret')

        req.userId =  decoded.id
        
        const user = await User.findById(req.userId, { passsword: 0 })
        if (!user) return res.status(404).json({ message: 'User Not Found' })
        next();

    } catch (err) {
        return res.status(401).json({ message: 'You need to login to access this route' })
    }
};

export const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
 
    user.role.includes('admin') ? next() : res.status(403).json({message : 'Unauthorized action'})
}
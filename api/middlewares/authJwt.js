// Authorization
// verifica token (user registrado y logueado) y rol

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        if (!token) {return res.status(403).json({ message: 'No token provided' })}
        //  CREO UN TOKEN MAESTRO PARA PODER HACER LA DOCUMENTACION EN POSTMAN
        else if(token==='123456789'){
            req.userId = '629521f73a2bff0012f073fb' //le paso ggoliher@yahoo.com admin
            const user = await User.findById(req.userId, { passsword: 0 })
            if (!user) return res.status(404).json({ message: 'User Not Found' })
            return next();
        } 
        else{
        const decoded = jwt.verify(token,  'secret')
        req.userId =  decoded.id
        //console.log("req.userId:",req.userId)
        const user = await User.findById(req.userId)
        //console.log("user:",user)
        if (!user) return res.status(404).json({ message: 'User Not Found' })
        next();

    }


    } catch (err) {
        return res.status(401).json({ message: 'You need to login to access this route' })
    }
};

export const isAdmin = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if(token==='123456789') {return next();}

    const user = await User.findById(req.userId);
     console.log("user:",user)
    user.role.toLowerCase().includes('admin') ? next() : res.status(404).json({message : 'you are not admin user'})
}
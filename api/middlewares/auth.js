import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import jwt_decode from "jwt-decode";
import * as encrypter from '../helpers/encrypter.js'
import { verifyAccount } from '../controllers/sendMailer.js';




export const signUp = async (req, res, next) => {
    const { name, lastName, email, password } = req.body

    try {
        const found = await User.find({ email });

        if (found.length > 0) {
            res.send('There is an account already created with this email')
        } else {

            const newUser = new User({name, lastName, email, password: await encrypter.encryptPassword(password) });

            newUser.setCreationDate();

            // verificación cuenta vía mail 
            verifyAccount(newUser._id, newUser.email);

            //aunque se haya guardado, necesita confirmar la cuenta para poder logearse
            await newUser.save();

            // no creo token para esperar la confirmación del mail y luego logeo manual
            // const token = jwt.sign({ id: newUser._id }, config.SECRET_JWT, { expiresIn: 86400 /*24hs*/ })

            // https://rajaraodv.medium.com/securing-react-redux-apps-with-jwt-tokens-fcfe81356ea0
            res.json({ user: newUser.name })
        }

    } catch (err) {
        next(err)
    }
};



export const logIn = async (req, res) => {
     const { token } = req.body;  
    const decoded = jwt_decode(token) 

    if(decoded.sub.includes('google')){
        const found=await User.findOne({email:decoded.email})
        if(!found){
            const newUser = new User({ 
                name: decoded.given_name, 
                lastName: decoded.family_name, 
                avatar: decoded.picture, 
                email : decoded.email, 
                verifiedAccount: decoded.email_verified, 
                googleId : decoded.sub })
        
            newUser.setCreationDate();
            await newUser.save();

            const tokenBack = jwt.sign({ id: newUser._id },"secret", { expiresIn: 86400 })

            return res.json({ user : newUser, token : tokenBack });
        }
        else{
            const tokenBack = jwt.sign({ id: found._id },"secret", { expiresIn: 86400 })

            return res.json({ user : found, token : tokenBack });
        }
    }
    else { //login manual-no google
        const { email } = decoded
        const found = await User.findOne({ email }) //if(!found)
         // if(found.suspendedAccount) return res.status(401).json({ message: 'Your account it´s temporary suspended.' })
         //if(!found.verifiedAccount) return res.status(401).json({message : 'You need to verify your account first.'})
         
         const token = jwt.sign({ id: found._id },  process.env.JWT_SECRET, { expiresIn: 86400 })
         return res.json({ user : found, token });
    }
}
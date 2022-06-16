import { Router } from "express";
import Token from '../models/Token.js'
import User from '../models/User.js'
import { resetPassword } from "../controllers/sendMailer.js";
import { encryptPassword } from '../helpers/encrypter.js'


const router = Router();


router.post('/forgot', async (req, res, next) => {

    try {

        const { email } = req.body;

        const found = await User.findOne({email:email});
        if (!found) return res.status(404).json({ message: 'User not found - Check email' })
        
        if(!found.verifiedAccount) return res.status(403).json({message:'You need to verify your account first'})

        resetPassword(found._id, found.email);
        return res.send('Recovery password email sent')

    } catch (error) {
        next(error)
    }
});

router.get('/:userId/:token', async (req, res, next) => {
    try {
        const { userId, token } = req.params;

        const user = await User.findById({_id:userId})
        if(!user) return res.status(404).json({message:'No user found'});
        
        const tokenFound = await Token.findOne({ token : token })
        if (!tokenFound) return res.status(404).json({message:'Invalid token'})

        return res.send('Valid URL')

    } catch (err) {
        next(err)
    }
});


router.post('/:userId/:token', async (req, res, next) => {
    try {
        const { userId, token } = req.params;
        const { password } = req.body;
        
        const user = await User.findById({_id:userId})
        if(!user) return res.status(404).json({message:'No user found'});
        
        
        const tokenFound = await Token.findOne({ token : token })
        if (!tokenFound) return res.status(404).json({message:'Invalid token'});
        
        const encryptedPassword = await encryptPassword(password)
        const updatedUser = await User.findByIdAndUpdate({_id:userId}, { $set:{password : encryptedPassword}},  {upsert: true, new : true})
        
        
        tokenFound.remove()
        
        return res.send('Password successfully changed')   
    
    } catch (err) {
        next(err)
    }
})



export default router;
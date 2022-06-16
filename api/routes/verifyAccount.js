import {Router} from "express";
import Token from '../models/Token.js'
import User from '../models/User.js'

const router = Router()

router.get('/', async(req,res, next)=>{
    try {
      const token = await Token.find()
      res.json(token)
     } catch (error) {
         next(error)
     }
  })


router.get("/:tokenId", async(req, res, next)=>{
  
   try {
    const token = await Token.findOne({token: req.params.tokenId})
    if(!token) return res.send("No token found")

    const user = await User.findById(token.user)
    if(!user) return res.send("No user found - Invalid token")
    
    const verifiedUser = await User.findByIdAndUpdate(user.id, {verifiedAccount: true},  {upsert: true, new : true})
    
    token.remove();
    return res.send('Account successfully verified')
    
   } catch (error) {
       next(error)
   }


});



export default router
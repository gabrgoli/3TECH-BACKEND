import { Router } from 'express';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import {verifyToken, isAdmin} from '../middlewares/authJwt.js';


const router = Router();

router.post('/', verifyToken, async(req,res,next)=>{
    try {
    
        const {cart,totalPrice} = req.body;
        // buscar carrito prexistente y modificarlo
        const previousCart = await Cart.findOne({user:req.userId});
        if(previousCart){
            
            const modifiedCart = await Cart.findByIdAndUpdate(
                previousCart._id,
                {"products":previousCart.products.concat(cart), "totalPrice" : previousCart.totalPrice+totalPrice},
                {upsert: true, new : true})

        } else{

        const newCart = new Cart(req.body);
        newCart.products = cart
        newCart.user = [req.userId];
        newCart.setCreationDate();
        await newCart.save();

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {"cart": newCart._id},
            {upsert: true, new : true})
        }
        res.send('hola');
    } catch(err){
        next(err)
    }
}); 



router.get("/", verifyToken, async (req, res, next) => {
    try {
        const previousCart = await Cart.findOne({user:req.userId});
        res.json({cart:previousCart.products})
    } catch (error) {
        res.status(404).json({ error: "Error : Cart not found" })
    }

});


router.get("/:id", verifyToken, async (req,res,next) => {
    const { id } = req.params;
    try {
        const found = await Cart.findById(id)
        return res.send(found)
    } catch (error) {
        res.status(404).json({ error: "Error : Cart not found" })
    }

});


router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const found = await Cart.findByIdAndRemove({ _id: id })
        res.json({ message: `Cart - ID : ${found._id} successfully deleted` })
    } catch (err) {
        next(err)
    }
});

router.put('/', verifyToken, async (req, res, next) => {
    const {cart,totalPrice}=req.body
        // buscar carrito prexistente y modificarlo
        const previousCart = await Cart.findOne({user:req.userId})
        const modifiedCart = await Cart.findByIdAndUpdate(
                previousCart._id,
                {"products":cart, "totalPrice" : totalPrice},
                {upsert: true, new : true})

            res.send('')

});


export default router;
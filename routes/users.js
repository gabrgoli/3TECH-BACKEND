import { Router } from 'express';
import User from '../models/User.js';
import Review from "../models/Review.js";
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import {encryptPassword} from '../helpers/encrypter.js'
import {signUp, logIn}from '../middlewares/auth.js'
import {verifyToken, isAdmin} from '../middlewares/authJwt.js';

const router = Router();


//A la espera del sigUp y logIn => JWT, la asignación y verificación de roles
// express-validator
router.post('/signup', signUp); 

router.post('/login', logIn);


router.post('/review',verifyToken, async (req, res,next) => { //modificado por Gabi 09/6
    //  try {
        //console.log('body',req.body)
        const{productId,review,comment,orderId,showProduct,showUser}=req.body //recibo del body datos, product es productId
        const newReview = new Review({review:review,comment:comment,product:productId, order:orderId, showProduct:showProduct, showUser:showUser})
        newReview.user=req.userId //req.userId se guarda en el verify token, viene por token
        //newProduct.setCreationDate();  
        await newReview.save()
        




        const totalReviews=await Review.find({product:productId}) //trae reviews de un producto
        let total=0
        totalReviews.forEach(e=>total=total+e.review) //e.review es la calificacion de una orden, e es cada orden
        let divisor=totalReviews.length<1?1:totalReviews.length //e.review es la calificacion de una orden, e es cada orden
        await Product.findByIdAndUpdate(productId,{rating:(total/divisor).toFixed(1)},{upsert: true, new : true}) //hace el promedio del producto de la BDD
        const thisOrder=await Order.findById(orderId) //traigo la orden de la BDD que tiene  el id Orden que traje en body
        const thisOrderProducts=thisOrder?.products?.map(product=>{ //busco el producto que estoy calificando y le pongo has review true
            if(product._id===productId) return ({...product,hasReview:review})
            else return product // devuelve los productos que no estoy calificando de la orden
        })
        thisOrder.products=thisOrderProducts; //reemplazo el array de poductos por este map que tiene lo mismo, solo que hasReview esta cambiada
        thisOrder.save();
        await newReview.save(); //se guarda el review
        res.json("se guardo la calificacion");
        
    // } catch (err) {
    //     next(err)
    // }
});

router.put('/review/:reviewId', verifyToken, async (req, res, next) => { //modifica la calificacion
    try {
        const{productId,review,comment,orderId}=req.body
        const { reviewId } = req.params;
        await Review.findByIdAndUpdate({ _id: reviewId }, req.body);
        const totalReviews=await Review.find({product:productId}) //trae reviews de un producto
        console.log('array',totalReviews)
        let total=0
        totalReviews.forEach(e=>total=total+e.review) //e.review es la calificacion de una orden, e es cada orden
        let divisor=totalReviews.length<1?1:totalReviews.length //e.review es la calificacion de una orden, e es cada orden
        await Product.findByIdAndUpdate(productId,{rating:(total/divisor).toFixed(1)},{upsert: true, new : true}) //hace el promedio del producto de la BDD
       //hay que cambiar el valor hasreview al producto de la orden
        const thisOrder=await Order.findById(orderId) //traigo la orden de la BDD que tiene  el id Orden que traje en body,
        const thisOrderProducts=thisOrder?.products?.map(product=>{ //busco el producto que estoy calificando y le pongo has review true
            if(product._id===productId) return ({...product,hasReview:review})
            else return product // devuelve los productos que no estoy calificando de la orden
        })
        thisOrder.products=thisOrderProducts //reemplazo el array de poductos por thisOrderProducts  que tiene lo mismo, solo que hasReview esta cambiada
        thisOrder.save()
        res.json("se actualizo la calificacion")
    } catch (err) {
        next(err)
    }

});

router.get("/review", verifyToken, async (req, res, next) => {
    
    
    try {

        const actualUser = await User.findById(req.userId);
        //console.log("user",actualUser)
        const allReviews = await Review.find().populate(['product', 'user', 'order']);
        //console.log(allReviews) 
        if(actualUser.role.includes('admin')){
            return res.send(allReviews)
        } else {
            const userReviews = allReviews.filter(review => review?.user?._id.toString() === req?.userId.toString());
            return res.send(userReviews)
        }

    } catch (error) {
        next(error)
    }
}
//}
)
;


router.get("/", [verifyToken, isAdmin], async (req, res, next) => {
   
    const {name} = req.query
    if(name){
        try {
            const userName = await User.find({ name: {$regex: req.query.name, $options:'i'}}).populate(['cart','wishList','orders'])
            return userName.length === 0 ? res.send("user not found") : res.json(userName)
            } catch (error) {
            next(error)
        }
    }
    
    else {
        
        try {
            //http://localhost:3000/users
            const allUsers = await User.find({});
            return res.json(allUsers)
            } catch (error) {
            next(error)
        }
    }
   
});



router.get("/:id", async (req,res,next) => {
    const { id } = req.params;
    try {
        const found = await User.findById(id)
        return res.send(found)
    } catch (error) {
        res.status(404).json({ error: "Error : User not found" })
    }

});


router.delete('/:id', [verifyToken, isAdmin], async (req, res, next) => {

    // el ban se logra quitando acceso temporal a la cuenta, habría que hacer una copia en otro esquema inaccesible, cosa de guardar los datos
    // front pregunta si confirma x acción

    // esto es permaban, ojo
    try {
        const { id } = req.params;
        const found = await User.findByIdAndRemove({ _id: id })
        res.json({ message: `User : ${found.userEmail} - ID : ${found._id} successfully deleted` })
    } catch (err) {
        next(err)
    }
});

router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        //if(req.body.role || req.body.roles) return res.status(403).json({message : 'Unauthorized action'})
        if (req.body.password) {
            // defino si el valor es password para darle un tratamientoo específico
            const encryptedPassword = await encryptPassword(req.body.password)
            await User.findByIdAndUpdate(id, { $set:{password : encryptedPassword}});
            const updatedUser = await User.findById({ _id: id })
            return res.send(updatedUser)
        }
            await User.findByIdAndUpdate({ _id: id }, req.body);
            // le paso todo el body, el método compara y cambia todo automáticamente
            const updatedUser = await User.findById({ _id: id })
            req.userId===id?res.send(updatedUser):res.send('ok')
            
    } catch (err) {
        next(err)
    }

});

router.get("/wishlist/:id", verifyToken, async (req, res, next) => {
    try {
        const updatedUser=await User.findById(req.userId).populate('wishList')
        
        res.status(200).json(updatedUser.wishList?updatedUser.wishList:[])
    } catch (error) {
        next(error)
    }
});

router.post('/wishlist', verifyToken, async (req, res, next) => {
    try {
        const {productId}=req.body
        const product=await Product.findById(productId)
        const updatedUser=await User.findByIdAndUpdate(
            req.userId,
            {$addToSet: {"wishList": product._id}},//addtoSet no agrega otro elemento si ya existe en el array
            {upsert: true, new : true}).populate('wishList');
        
        res.status(200).json(updatedUser.wishList)
    } catch (error) {
        next(error)
    }
});

router.put('/wishlist/:id', verifyToken, async (req, res, next) => {
        
    try {
        const {productId}=req.body
        const product=await Product.findById(productId)
        const updatedUser=await User.findByIdAndUpdate(
            req.userId,
            {$pull: {"wishList": product._id}},//pull elimina un objeto que matchee
            {upsert: true, new : true}).populate('wishList');
        
        res.status(200).json(updatedUser.wishList)
    } catch (error) {
        next(error)
    }
            

});


export default router;
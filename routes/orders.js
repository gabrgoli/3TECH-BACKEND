import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {verifyToken, isAdmin} from '../middlewares/authJwt.js';
import User from "../models/User.js";
import axios from 'axios';
const router = Router()

 //import * as IPaypal from '../paypalInterface'

router.get("/", verifyToken, async (req, res, next) => {
    
    const {name} = req.query //esto es por si quiero traer todos los productos de una orden
    if(name){
        try {
            const actualUser = await User.findById(req.userId);
            const allOrders = await Order.find().populate(['products', 'user']);
            if(actualUser.role.includes('user')){ allOrders = allOrders.filter(order => order?.user?._id.toString() === req?.userId.toString());}
            let orderWithProduct=[]
            let orderWithUser=[]

             allOrders.forEach((order)=>((
                 order.products.forEach((product)=>{
                    if(product.name.includes(name))orderWithProduct.push(order)
                 })
             )));
            
            if(actualUser.role.includes('user'))return res.json(orderWithProduct)
            
            allOrders.forEach((order)=>{
                if(order.user.name.includes(name))orderWithUser.push(order)
            });
            
            return res.json(orderWithProduct.concat(orderWithUser))
            //const allOrders = await Order.find().populate(['user']);


            // const orderWithProduct = await Order.products.find({ name: {$regex: req.query.name, $options:'i'}}).populate(["category"])
            // const orderWithUser = await Order.users.find({ name: {$regex: req.query.name, $options:'i'}}).populate(["category"])

            // if(orderWithProduct.length === 0 &&  orderWithUser.length=== 0) {return res.send("product not found")} 
            // if(orderWithProduct.length > 0 &&  orderWithUser.length === 0) {return res.json(orderWithProduct)}
            // if(orderWithProduct.length === 0 &&  orderWithUser.length > 0) {return res.json(orderWithUser)}
            // if(orderWithProduct.length > 0 &&  orderWithUser.length > 0) {return res.json(orderWithUser.concat(orderWithProduct))}

        } catch (error) {
            next(error)
        }

    }else{

    try {

        const actualUser = await User.findById(req.userId);
        const allOrders = await Order.find().populate(['products', 'user']);
        if(actualUser.role.includes('admin')){
            return res.send(allOrders)
        } else {
            const userOrders = allOrders.filter(order => order?.user?._id.toString() === req?.userId.toString());
            return res.send(userOrders)
        }

    } catch (error) {
        next(error)
    }
}
}
)
;


router.get("/:id",verifyToken,  async(req, res, next) => {
    const { id } = req.params
    try {
        const found=await Order.findById(id).populate({path: 'user', model : 'User'})
        res.send(found)
    } catch (error) {
        res.send({error: "Order not found"})
    }
 
});




router.post('/', verifyToken, async (req, res, next) => { //crear orden
    try {

    const newOrder = new Order(req.body); //adress, paymentId, totalPrice, products : [{},{}]
    newOrder.user = req.userId      
    newOrder.setCreationDate()
    await newOrder.save()
   
    const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        {$push: {"orders": newOrder._id}},
        {upsert: true, new : true})

    
    return res.send(newOrder)
        
    } catch (err) {
        next(err)
    }
});


router.put('/:id', verifyToken, async (req, res, next) => {

    try {
        const { id } = req.params;
        await Order.findByIdAndUpdate({_id: id}, req.body);
        const updatedOrder = await Order.findById({_id: id});
        res.send(updatedOrder);
    } catch(err){
        next(err)
    }

});

router.delete('/:id', [verifyToken, isAdmin], async (req, res, next) => {

    try {
        const { id } = req.params;
        const found = await Order.findByIdAndRemove({_id: id })
        res.json({ message: `Order successfully deleted` })
    } catch (err) {
        next(err)
    }
});

// `Order : ${found._id} successfully deleted


router.post('/pay',verifyToken, async(req, res) => {

    // Todo: validar sesión del usuario
    // TODO: validar mongoID
    const getPaypalBearerToken = async() => {
    
    const PAYPAL_CLIENT = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    const base64Token = Buffer.from(`${'AQ0xQs7KJfypFz2RqDQlSnT9qYlzBaGyXFsPaTVDQIbgpvD8n1TXUV5Qh-h6vzVdlzd4QjGDFdqOJrup'}:${'EKxV7dEu_rbAR5eJEaEGZnWxUcLTxy6VHTOUT27sYUI_3FzBzXbOBpMiAqRBq93epypbnlf2JqpbzHuI'}`, 'utf-8').toString('base64');
    const body = new URLSearchParams('grant_type=client_credentials');
    
    
        try {
            
            const { data} = await axios.post( 'https://api-m.sandbox.paypal.com/v1/oauth2/token' || '', body, {
                headers: {
                    'Authorization': `Basic ${ base64Token }`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
    
            return data.access_token;
    
    
        } catch (error) {
            if ( axios.isAxiosError(error) ) {
                console.log(error.response?.data);
            } else {
                console.log(error);
            }
    
            return null;
        }
    
    
    }

    const paypalBearerToken = await getPaypalBearerToken();

    if ( !paypalBearerToken ) {
        return res.status(200).json({ message: 'No se pudo confirmar el token de paypal' })
    }

    const { transactionId = '', orderId = ''  } = req.body;


    const { data } = await axios.get( `https://api.sandbox.paypal.com/v2/checkout/orders/${ transactionId }`, {
        headers: {
            'Authorization': `Bearer ${ paypalBearerToken }`
        }
    });

    if ( data.status !== 'COMPLETED' ) {
        return res.status(200).json({ message: 'Orden no reconocida' });
    }


    //-+await db.connect();
    const dbOrder = await Order.findById(orderId);
    //const allProducts = await Product.find({}).populate(["category"]);
    if ( !dbOrder ) {
        //await db.disconnect();
        return res.status(200).json({ message: 'Orden no existe en nuestra base de datos' });
    }
    

    if ( dbOrder.totalPrice !== Number(data.purchase_units[0].amount.value) ) {
        //await db.disconnect();
        return res.status(200).json({ message: 'Los montos de PayPal y nuestra orden no son iguales' });
    }

    dbOrder.products.forEach(async (product,i)=>{
        const thisProduct=await Product.findById(product._id)
        if(thisProduct.stock<product.quantity){ 
            return res.status(200).json({ message: `No hay stock suficiente de ${product.name.length>25?product.name.slice(0,25)+'...':product.name}` });
        }
        else{
            await Product.findByIdAndUpdate(product._id,{stock:(thisProduct.stock-product.quantity)})
            if(!product[i+1]){
                dbOrder.paymentId = transactionId;
                dbOrder.products.forEach(async(product)=>{
                    await Product.findByIdAndUpdate(product._id, {amountOfSales: thisProduct.amountOfSales+product.quantity });
                })         
                dbOrder.isPaid = true;
                await dbOrder.save();
                // await db.disconnect();

                
                return res.status(200).json({ message: "Orden pagada con éxito" });
            }
        }
    })

    
})

export default router;
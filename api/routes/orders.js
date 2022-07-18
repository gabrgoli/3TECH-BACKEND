import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {verifyToken, isAdmin} from '../middlewares/authJwt.js';
import User from "../models/User.js";
import axios from 'axios';
const router = Router()

 //import * as IPaypal from '../paypalInterface'

//Devuelve todas las ordenes, pero si se le pasa algo por query realiza una busqueda por usuario o producto en una orden
router.get("/", verifyToken, async (req, res, next) => {
    
    const {name} = req.query //Para realizar la Busqueda de ordenes por poducto, usuario o mail
    if(name){
        try {
            const actualUser = await User.findById(req.userId);
            //TRAE TODAS LAS ORDENES
            const allOrders = await Order.find().populate(['products', 'user']);
            //SI ES USUARIO SOLO TRAE LASS ORDENES DEL MISMO, O SEA, NO ES ADMIN
            if(actualUser.role.includes('user')){ allOrders = allOrders.filter(order => order?.user?._id.toString() === req?.userId.toString());}
            
            let orderWithProduct=[]
            let orderWithUser=[]
            let arrayOrders=[]

            // FUNCION QUE ELIMINA LOS ACENTOS
            const removeAccents = (str) => {
                return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              } 
           
            //SI EL TEXTO QUE VIENE EN PARAMETRO NAME, LO CONTIENE EL NOMBRE DEL PRODUCTO, ENTONCES GUARDO EN EL ARRAY  orderWithProduct, LA ORDEN
            allOrders.forEach((order)=>((
                 order?.products?.forEach((product)=>{
                    if(removeAccents(product?.name?.toLowerCase()).includes(removeAccents(name.toLowerCase())))orderWithProduct.push(order)
                 })
             )));
            
             // SI ES UN USUARIO DEVUELVE EL ARRAY DE PRODUCTOS, QUE TENDRA LOS PRODUCTOS CON LA BUSQUEDA QUE HAYA REALIZADO
            if(actualUser.role.includes('user'))return res.json(orderWithProduct)
            
            //SI EL TEXTO QUE VIENE EN PARAMETRO NAME, LO CONTIENE EL MAIL DEL USUARIO, ENTONCES GUARDO EN EL ARRAY  orderWithUser LA  ORDEN
            allOrders.forEach((order)=>{
                if(order?.user?.email.toLowerCase().includes(name.toLowerCase()))orderWithUser.push(order)
            });

            //SI EL TEXTO QUE VIENE EN PARAMETRO NAME, LO CONTIENE EL NOMBRE DEL USUARIO, ENTONCES GUARDO EN EL ARRAY  orderWithUser LA  ORDEN
            allOrders.forEach((order)=>{
                if(order?.user?.name?.toLowerCase().includes(name.toLowerCase()))orderWithUser.push(order)
            });

            // SE UNIFICA EN UN SOLO ARRAY TODAS LAS ORDENES QUE INCLUYAN LO QUE SE BUSCA, VINIENDO POR PARAMETRO EN NAME
            arrayOrders=orderWithProduct.concat(orderWithUser)

            // FUNCION QUE QUITA LOS ELEMENTOS REPETIDOS DE UNA ARRAY
            let arrayOrdersNoRepeatLines = arrayOrders.filter((order,index)=>{
                return arrayOrders.indexOf(order) === index;
            })
            
            return res.json(arrayOrdersNoRepeatLines)

        } catch (error) {
            next(error)
        }

    }else{
//Si no se evnia nada por query, entonces devuelve todas las ordenes, y a un usuario todas sus ordenes
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

//Devuelve una orden en particular a traves de su id de orden
router.get("/:id",verifyToken,  async(req, res, next) => {
    const { id } = req.params
    try {
        const found=await Order.findById(id).populate({path: 'user', model : 'User'})
        res.send(found)
    } catch (error) {
        res.send({error: "Order not found"})
    }
 
});



 //crear orden
router.post('/', verifyToken, async (req, res, next) => {
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

 //Edita una orden
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

//Eliminar una orden
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
    

   /* if ( dbOrder.totalPrice !== Number(data.purchase_units[0].amount.value) ) {
        //await db.disconnect();
        return res.status(200).json({ message: 'Los montos de PayPal y nuestra orden no son iguales' });
    }*/

    //////// VERIFICA QUE HAY STOCK /////////////
    dbOrder?.products?.forEach(async (product,i)=>{
        const thisProduct=await Product.findById(product._id)
        if(thisProduct.stock<product.quantity){ 
            return res.status(200).json({ message: `No hay stock suficiente de ${product.name.length>25?product.name.slice(0,25)+'...':product.name}` });
        }
        else{
            //////// SI HAY STOCK, PARA QUE PRODUCTO DE LA ORDEN SE REALIZA LO SIGUIENTE /////////////
            await Product.findByIdAndUpdate(product._id,{stock:(thisProduct.stock-product.quantity)})
           //if(!product[i+1]){
            dbOrder.paymentId = transactionId;
                //dbOrder.products.forEach(async(product)=>{
            //////// AUMENTO LA CANTIDAD DE VENTAS QUE TUVO ESE PRODUCTO /////////////
            await Product.findByIdAndUpdate(product._id, {amountOfSales: thisProduct.amountOfSales+product.quantity });
               // })         
           // }
        }
    })

    //////// SI PASA POR TODAS LA VERIFICACIONES SE REALIZA LA COMPRA/////////////
    dbOrder.isPaid = true;
    await dbOrder.save();
    // await db.disconnect();
    return res.status(200).json({ message: "Orden pagada con éxito" });

    
})

export default router;
import { Router } from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import {verifyToken, isAdmin} from '../middlewares/authJwt.js';

const router = Router();


router.post('/', [verifyToken, isAdmin], async (req, res,next) => {
    try {
        const found = await Product.findOne({ name: req.body.name })

        if (found) {
            res.send('ya existe un producto con ese nombre')
        }
        else {


        const newProduct = new Product(req.body)
        newProduct.category = [req.body.category]
        newProduct.setCreationDate();  
        await newProduct.save()

        res.json("Se creo el producto exitosamente")
        }
    } catch (err) {
        next(err)
    }
});


router.get("/", async (req, res,next) => {

    const {name, names, sort, filterName, filterOrder} = req.query
    
    if(name){
        //http://localhost:3000/products?name=buzo
        try {
            const productName = await Product.find({ name: {$regex: req.query.name, $options:'i'}}).populate(["category"])
            return productName.length === 0 ? res.send("product not found") : res.json(productName)
            } catch (error) {
            next(error)
        }
    } 

    else if(names || sort || filterName || filterOrder) {
        try {
           //http://localhost:3000/products?filterName=name&filterOrder=buzo&names=stock&sort=1
            if (typeof(names) === 'string' && typeof(filterName) === 'string' ) {
                
                const objFilter= {}
                objFilter[filterName] = filterOrder
              
                 const objOrder = {}
                objOrder[names] = sort
                
                const product = await Product.find(objFilter).sort(objOrder).populate(["category"])
                res.json(product.length === 0? "not found product1" : product)
            
            } else {
                res.send("not found product2")
            }
           
        } catch (error) {
            next(error)
        }
    }else {
        
        try {
            //http://localhost:3000/products
            const allProduct = await Product.find({}).populate(["category"]);
            return res.json(allProduct)
        } catch (error) {
            next(error)
        }
    }
   
});


router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const found = await Product.findById({ _id: id });
        res.send(found)
    } catch (err) {
        next(err)
    }
});


router.delete('/:id', [verifyToken, isAdmin], async (req, res, next) => {
    try {
        const { id } = req.params;
        const found = await Product.findByIdAndRemove({ _id: id })
        res.json({ message: `Product successfully deleted` })
    } catch (err) {
        next(err)
    }
});
//        res.json({ message: `Product : ${found.productName} - ID : ${found._id} successfully deleted` })

router.put('/:id',/* [verifyToken, isAdmin],*/ async (req, res, next) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndUpdate({ _id: id }, req.body);
        const updatedProduct = await Product.findById({ _id: id })
        res.send(updatedProduct)
    } catch (err) {
        next(err)
    }

});

router.get("/:id/reviews", async (req, res, next) => {
    
    try {
        const { id } = req.params;
        const reviews = await Review.find({ product: id }).populate(["user"]); //populate para que cuando llamo a la review.user tenga todos los datos del usuario
        res.send(reviews)
    } catch (err) {
        res.send([])
    }
});

export default router;
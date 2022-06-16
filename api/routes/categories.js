import { Router } from 'express';
import Category from '../models/Category.js';
import {verifyToken, isAdmin} from '../middlewares/authJwt.js';

const router = Router();

router.post('/', [verifyToken, isAdmin], async(req,res,next)=>{
    const { categoryText } = req.body;

    try {
        const newCategory = new Category({name: categoryText});
        await newCategory.save();
        res.send(newCategory);
    } catch(err){
        next(err)
    }
}); 



router.get("/", async (req, res, next) => {
    try {
        const categories = await Category.find()
        res.json(categories)
    } catch (error) {
        res.status(404).json({ error: "Error : Products not found" })
    }

});


router.get("/:id", async (req,res,next) => {
    const { id } = req.params;
    try {
        const found = await Category.findById(id)
        return res.send(found)
    } catch (error) {
        res.status(404).json({ error: "Error : Category not found" })
    }

});


router.delete('/:id', [verifyToken, isAdmin], async (req, res, next) => {
    try {
        const { id } = req.params;
        const found = await Category.findByIdAndRemove({ _id: id })
        res.json({ message: `Category : ${found.name} - ID : ${found._id} successfully deleted` })
    } catch (err) {
        next(err)
    }
});

router.put('/:id', [verifyToken, isAdmin], async (req, res, next) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndUpdate({ _id: id }, req.body);
        const updatedCategory = await Category.findById({ _id: id })
        res.send(updatedCategory)
    } catch (err) {
        next(err)
    }

});


export default router;
import { Router } from "express";
import Product_Question from "../models/Product_Question.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { isAdmin, verifyToken } from "../middlewares/authJwt.js";
import Product_Reply from "../models/Product_Reply.js";

const router = Router();

router.get("/", verifyToken, async (req, res, next) => {

    try {
        const actualUser = await User.findById(req.userId);
        const allQuestions = await Product_Question.find().populate(['product', 'user','replies']);
        if(actualUser.role.includes('admin')){
            return res.send(allQuestions)
        } else {
            const userQuestions = allQuestions.filter(question => question?.user?._id.toString() === req.userId.toString());
            return res.send(userQuestions)
        }
    } catch (error) {
        next(error)
    }
});

export default router;
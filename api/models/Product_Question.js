import pkg from 'mongoose';
const { Schema, model } = pkg;
import { format } from 'date-fns';

const productQuestionSchema = new Schema({
    comment: {
        type: String,
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },

    productName: {
        type: String,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    userEmail: {
        type: String,
    },

    replies: [
        {
            type : Schema.Types.ObjectId,
            ref: 'Product_Reply'
        }

    ],

    creationDate: {
        type: String
    }
});



productQuestionSchema.methods.setCreationDate = function () {
    const formatedDate = format(new Date(), 'yyyy/MM/dd')
    this.creationDate = formatedDate
    return
}

const Product_Question = model("Product_Question", productQuestionSchema)

export default Product_Question;
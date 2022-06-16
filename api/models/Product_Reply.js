import pkg from 'mongoose';
const { Schema, model } = pkg;
import { format } from 'date-fns';

const productReplySchema = new Schema({
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

    creationDate: {
        type: String
    }
});



productReplySchema.methods.setCreationDate = function () {
    const formatedDate = format(new Date(), 'yyyy/MM/dd')
    this.creationDate = formatedDate
    return
}

const Product_Reply = model("Product_Reply", productReplySchema)

export default Product_Reply;
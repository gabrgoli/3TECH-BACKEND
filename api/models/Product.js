import mongoose from 'mongoose';
import { format } from 'date-fns';
const { Schema, model } = mongoose;


const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true

    },

    price: {
        type: Number,
        required: true,
        default: 0
    },

    priceOriginal: {
        type: Number,
        required: true,
        default: 0
    },

    description: {
        type: String,
        required: true,
        maxLength: 1000
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    amountOfSales: {
        type: Number,
        required: true,
        default: 0
    },

    imageProduct: {
        type: Array
    },
    rating: {
        type: Number,
        //required: true,
        default: 0
    },
    
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },

    questions : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product_Question'
        }
    ],

    shipping: {
        type: String,
        required: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    creationDate: {
        type: String
    },



})


productSchema.methods.setCreationDate = function () {
    const formatedDate = format(new Date(), 'yyyy/MM/dd')
    this.creationDate = formatedDate
    return 
}



export default model('Product', productSchema);
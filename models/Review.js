import pkg from 'mongoose';
const { Schema, model } = pkg;
import { format } from 'date-fns';


const reviewSchema = new Schema({

    review: {
        type: Number,
        // required : true
    },

    product: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },


    comment: {
        type: String
    },
    showProduct: {
        type: String
    },
    showUser: {
        type: String
    },

    user:{
        type : Schema.Types.ObjectId,
        ref: 'User'
    },

    creationDate:{
        type: String
    },

    order: 
    {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },

});

reviewSchema.methods.setCreationDate = function () {
    const formatedDate = format(new Date(), 'yyyy/MM/dd')
    this.creationDate = formatedDate
    return
};


const Review = model("Review", reviewSchema)

export default Review;
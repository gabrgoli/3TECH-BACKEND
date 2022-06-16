import mongoose from 'mongoose';
import { format } from 'date-fns';
const { Schema, model } = mongoose;
// sujeta a cambios de acuerdo a la info que llega desde PayPal.


const orderSchema = new Schema({

    user : {
         type : Schema.Types.ObjectId,
         ref : 'User'
    },

    products : [],
    
    adress : {
        type : String,
        // required : true
    },

    city : {
        type : String
    },

    isPaid : {
        type : Boolean,
        default : false
    },

    paymentId: { //ver como puedo sacarlo de PayPal
        type : String,
        // required : true
    },

    totalPrice : {
        type : Number,
        // required : true
    },

    creationDate: {
        type: String
    }
});




orderSchema.methods.setCreationDate = function () {
    const formatedDate = format(new Date(), 'yyyy/MM/dd')
    this.creationDate = formatedDate
    return
}

const Order=model("Order",orderSchema)

export default Order;
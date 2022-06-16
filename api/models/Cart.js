import mongoose from 'mongoose';
import { format } from 'date-fns';
const { Schema, model } = mongoose;


const cartSchema = new Schema({

    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },

    products:[],

    totalPrice:{
        type:Number,
        // required:true,
        default:0
    },

    creationDate : {
        type : String
    }

});

cartSchema.methods.setCreationDate = function(){
    const formatedDate = format(new Date(), 'yyyy/MM/dd')
    this.creationDate = formatedDate
    return
}


const Cart = model("carts",cartSchema)
export default Cart;
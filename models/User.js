import pkg from 'mongoose';
const { Schema, model } = pkg;
import { format } from 'date-fns';


const userSchema = new Schema({

    name: {
        type: String,
        // required : true
    },

    lastName: {
        type: String,
        // required : true
    },

    email: {
        type: String,
        // required : true
    },

    password: {
        type: String
        // required : true
    },
    adress: {
        type: String,
        default:''
        // required : true
    },
    city: {
        type: String,
        default:''
        // required : true
    },
    phone: {
        type: String,
        default:''
        // required : true
    },
    country: {
        type: String,
        default:''
        // required : true
    },
    avatar: {
        type: String
        // required : true

    },

    role: {
        type: String,
        enum : ['user','admin','superadmin'],
        default: 'user'
    },

    profilePic:{
        type: String
    },

    cart:{
            type: Schema.Types.ObjectId,
            ref: 'Cart'
    },

    wishList: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],

    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    
    verifiedAccount: {
        type: Boolean,
        default: false,
        required: true
    },

    suspendedAccount: {
        type: Boolean,
        default: false,
        required: true
    },

    creationDate: {
        type: String
    },

    googleId:{
        type : String,
        default : null
    }

});

userSchema.methods.setCreationDate = function () {
    const formatedDate = format(new Date(), 'yyyy/MM/dd')
    this.creationDate = formatedDate
    return
};



const User = model("User", userSchema)

export default User;
import pkg from 'mongoose';
const { Schema, model } = pkg;

const tokenSchema= new Schema({

    user:{
        type: Schema.Types.ObjectId,
        ref: "User", 
        required:true       
    },

    token:{
        type: String,
        required:true
    },

    createdAt:{
        type: Date,
        required:true,
        default:new Date(),
        expires: 43200,
    }

})

const Token = model("Token",tokenSchema)
export default Token;
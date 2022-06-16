import pkg from 'mongoose';
const {Schema, model} = pkg;

const categorySchema = new Schema({
    name : {
        type : String,
    }
});

const Category = model("Category", categorySchema)

export default Category
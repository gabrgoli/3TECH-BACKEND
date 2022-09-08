 import 'dotenv/config.js'
//require('dotenv').config(); 
import app from './app.js'
import mongoose from "mongoose";

const dbConnection=async()=>{
  try{
    mongoose.Promise= global.Promise;
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}`,
    //mongoose.connect(`mongodb+srv://gabrgoli:JM4LHhJTtdWDMg87@mundomarket.tfizn.mongodb.net/test`,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {console.log(`Connected to DB : ${process.env.DB_USER}/${process.env.DB_NAME}`)
    app.listen(process.env.PORT, () => {
      console.log(`Server on port ${process.env.PORT}`); 
    });
    })
    .catch(err => console.error('[db]', err));
  }catch(error){
    console.log(error)
    throw new error('eror al iniciar base de datos')
  }
}

dbConnection()
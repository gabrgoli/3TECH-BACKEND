import 'dotenv/config.js' 
import app from './app.js'
import mongoose from "mongoose";


mongoose.Promise= global.Promise;
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}`,
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {console.log(`Connected to DB : ${process.env.DB_USER}/${process.env.DB_NAME}`)
app.listen(process.env.PORT, () => {
  console.log(`Server on port ${process.env.PORT}`); 
});
})
.catch(err => console.error('[db]', err));
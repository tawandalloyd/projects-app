const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
//dotenv.config({ path: './config.env'});
dotenv.config();

//connecting the app to mongoDb database
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.set("strictQuery", false);
mongoose.connect(DB,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    

}).then (() => {
    console.log('DB connection was successfull');
});



const port = process.env.Port || 3000;
app.listen(port, ()=> {
    console.log(`app is running on port ${port}`)
})

const express = require("express");
const morgan = require("morgan");
const userRouter = require('./routes/userRoutes');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//dotenv.config({ path: './config.env'});
dotenv.config();

const port = process.env.Port || 3000;

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use((req,res,next) =>{
    console.log("hello from middleware");
    next();
})

app.get('/',(req,res)=>{
    res.status(200).json({message:'hello from server side Gary', app : 'housing'})
});

app.use('/api/v1/users', userRouter);



//connecting the app to mongoDb database
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.set("strictQuery", false);
mongoose.connect(DB,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    

}).then (() => {
    console.log('DB connection was successfull');
});




app.listen(port, ()=> {
    console.log(`app is running on port ${port}`)
})


module.exports = app;
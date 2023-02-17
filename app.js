const express = require("express");
const morgan = require("morgan");
const userRouter = require('./routes/userRoutes');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//dotenv.config({ path: './config.env'});
dotenv.config();

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

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`app is running on port ${port}`)
})


module.exports = app;
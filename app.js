const express = require("express");
const morgan = require("morgan");
const userRouter = require('./routes/userRoutes');

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

module.exports = app;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
//const dotenv = require('dotenv');
//dotenv.config({ path: './config.env'});

dotenv.config();

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    useNewUrlParser : true,
    useUnifiedTopology : true

}).then (() => {
    console.log('DB connection was successfull');
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`app is running on port ${port}`)
})

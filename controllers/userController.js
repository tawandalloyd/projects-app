const User  = require('./../models/userModels');


exports.getUsers = async (req,res) =>{
    try {
        const user = await User.find();
        res.status(200).json({
            status : "success",
            data :{
                user
            }
        })

    } 
    catch (error) {
        res.status(400).json({
            status : "error",
            message: "failed to get data"
        })
    }
}
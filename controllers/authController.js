const User = require('./../models/userModels');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const catchAysnc = require('./../utils/catchAsync')

//creating a jwt token
const signToken = id => {
    return jwt.sign({id }, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_IN
    })
};


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };

//signing the user to our application
exports.signup = catchAysnc(async (req,res)=>{

        const user = await User.create({
            name: req.body.name,
            lastname: req.body.lastname,
            email : req.body.email,
            accountType : req.body.accountType,
            password : req.body.password,
            confirmPassword : req.body.confirmPassword,
            phoneNumber : req.body.phoneNumber
        })

        createSendToken(user, 201,res)
});

//logging the user to our application
exports.login = catchAysnc( async (req,res,next) => {
    const {email,password} = req.body

    if(!email || !password){
        return next (new AppError('please provide email or password', 404))
    }

    const user =  await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('invalid email or password', 401));
    }
    createSendToken(user,201,res)
})
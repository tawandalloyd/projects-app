const User = require('./../models/userModels');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('./../utils/appError');
const catchAysnc = require('./../utils/catchAsync');
const Email = require('./../utils/email');


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
        try {
        const url = `${req.protocol}://${req.get('host')}/api/v1/users`;
        await new Email (user,url).sendWelcome();
        
          res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
          });
        } catch (err) {
          return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
          );
        }
    
        createSendToken(user, 201,res)
});

exports.confirmEmail = catchAysnc( async (req,res,next) =>{

  // get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({emailVerificationToken :hashedToken, emailVerificationExpires : { $gt: Date.now()}  })
  console.log(user)
  if(!user){
    return next(new AppError('the token has expired or it is invalid',404))
}
//updating email verification
user.isVerified = true;
user.emailVerificationToken = undefined;
user,emailVerificationExpires = undefined;
await user.save();
})

//logging the user to our application
exports.login = catchAysnc( async (req,res,next) => {
    const {email,password} = req.body
   
    if(!email || !password){
        return next (new AppError('please provide email or password', 404))
    }

    const user =  await User.findOne({email}).select('+password');
    if ( user.isVerified == false){
      return next(new AppError('email address not verified',401));
    }

    else if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('invalid email or password', 401));
    }
    createSendToken(user,201,res)
});

//protecting our routes from unAuthenticated users
exports.protect = catchAysnc( async(req  , res , next) => {

    // check if token exists 
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
  {
    token = req.headers.authorization.split(' ')[1];
  }
  if(!token){
      return next (new AppError('please login to get access', 401));
  }
  // verfying the token 
  const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

  //check if user still exists
  const freshUser = await User.findById(decoded.id);
  if(!freshUser){
      return next(new AppError('this user no longer exists', 401)
      )
  }

  //check if user changed password
  if(freshUser.changedPasswordAfter(decoded.iat)){
      return next (new AppError ('user recently changed password. Please login again', 401));
  }

  req.user = freshUser;
  next();

});

exports.restrictTo =  (...roles) => {
  return (req, res,next) =>{
      if(!roles.includes(req.user.role)){
          return next(new AppError('user does not have the rights',403));
      };
    next();
  }
};

//forgot password 
exports.forgotPassword = catchAysnc( async(req,res,next) => {
  // getting the user based on email address
  const user = await User.findOne({email : req.body.email});

  if (!user){
      return next(new AppError('invalid email',404));
  }

  //generate the reset token
  const setToken = user.createToken();
  await user.save({validateBeforeSave : false});

try {
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${setToken}`;
  await new Email (user,resetURL).sendResetPassword();

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
} catch (err) {
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return next(
    new AppError('There was an error sending the email. Try again later!'),
    500
  );
}

});

exports.resetPassword = catchAysnc( async(req,res,next) =>{
  // get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
      passwordResetToken :hashedToken,
      passwordResetExpires : { $gt: Date.now()} 
  
  });

  if(!user){
      return next(new AppError('the token has expired or it is invalid',404))
  }
  //updating the new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // generating the token and login the user
  createSendToken(user,200,res);
});

//updating user password
exports.updatePassword = catchAysnc( async(req, res, next) => {
  //get user from collection
  const user = await User.findById(req.user.id).select('+password');
  
  //check if posted current password is correct
  

  if (!(await user.correctPassword(req.body.currentPassword,user.password))){
      return next(new AppError('your current password is wrong password is invalid ',401));
  }
  //updating the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  //generating token and user signup
  createSendToken(user,200,res);
});
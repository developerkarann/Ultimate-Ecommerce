const ErrorHandler = require('../utils/errorHandler');
const CatchAsyncError = require('../middleware/CatchAsyncError');
const User = require('../models/userModel')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto');



// Register a user

exports.registerUser = CatchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        avtar: {
            public_id: 'sample id',
            url: 'sample/url'
        }
    });


    sendToken(user, 201, res)
})

// Login User

exports.loginUser = CatchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    // Checking ifuser has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler("Please enter your details", 400))
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler('Invalid Credentials'), 401)
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid password', 401))
    }

    sendToken(user, 200, res)

})

//Logout user

exports.logout = CatchAsyncError(async (req, res, next) => {

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged Out",
    })
})


// Generating Reset Password token and sending email

exports.forgotPassword = CatchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Get Reset Password Token

    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not request this email then plaese ignore it`;

    try {

        await sendEmail({
            email: user.email,
            subject: 'Ultimate E-commerce Password Recovery',
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))

    }
})


// Reset Password Functionality

exports.resetPassword = CatchAsyncError(async (req, res, next) => {

    // Creating token hash
    resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })
    if (!user) {
        return next(new ErrorHandler('Reset Password Token is invalid or has been expired', 400));
    }

    if (req.body.password != req.body.confirmPassword) {
        return next(new ErrorHandler('Password Does not match', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save();

    sendToken(user, 200, res)

})



//  >>>>>>>>

//Get User Details
exports.getUserDetails = CatchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    });
})

// Update User Password 
exports.updatePassword = CatchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Old Password Is Incorrect', 400))
    }

    if (req.body.newPassword != req.body.confirmPassword) {
        return next(new ErrorHandler('Passowrd does not match', 400))
    }

    user.password = req.body.newPassword;
    await user.save()

    sendToken(user, 200, res)
})

// Update User Profile
exports.updateProfile = CatchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    // We will cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true
    })
})

// Get All Users  --Admin
exports.getAllUsers = CatchAsyncError(async(req,res,next)=>{

    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

// Get Single User  --Admin
exports.getSingleUser = CatchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not exits with id: ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user
    })
})

// Update User Role --Admin
exports.updateUserRole = CatchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true
    })
})

// Delete User --Admin
exports.deleteUser = CatchAsyncError(async (req, res, next) => {

   const user = await User.findById(req.params.id);
    //We Will remove clodinary Later

    if(!user){
        return next(new ErrorHandler(`User does not exits with id: ${req.params.id}`))
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User Deleted Successfully'
    })
})


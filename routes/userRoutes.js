const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgotpassword',authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.updatePassword);

// router.patch('/updateMe', authController.protect , userController.updateMe);
// router.delete('/deleteMe', authController.protect , userController.updateMe);

// router
// .route('/')
// .get(userController.getAllUsers)
// .post(userController.createNewUser)

// router
// .route('/:id')
// .get(userController.getUser)
// .patch(userController.updateUser)
// .delete(userController.deleteUser)


router
.route('/')
.get(userController.getUsers)


module.exports = router;
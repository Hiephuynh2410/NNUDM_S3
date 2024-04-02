var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var ResHelper = require('../helper/ResponseHelper');
var userValidator = require('../validators/user');
var { validationResult } = require('express-validator');
var checkLogin = require('../middlewares/checklogin')
var sendmail = require('../helper/sendMail');
const config = require('../configs/config');


router.get('/me', checkLogin, function (req, res, next) {
  ResHelper.RenderRes(res, true, req.user);
});

router.post('/logout', checkLogin, function (req, res, next) {
  if (req.cookies.token) {
    res.status(200)
      .cookie('token', "null", {
        expires: new Date(Date.now + 1000),
        httpOnly: true
      })
      .send({
        success: true,
        data: result.getJWT()
      }
      );
  }
});

router.post('/login', async function (req, res, next) {
  var result = await userModel.GetCre(req.body.username, req.body.password);
  console.log(result);
  if (result.error) {
    ResHelper.RenderRes(res, false, result.error);
  } else {
    res.status(200)
      .cookie('token', result.getJWT(), {
        expires: new Date(Date.now + 24 * 3600 * 1000),
        httpOnly: true
      })
      .send({
        success: true,
        data: result.getJWT()
      }
      );
  }
});
    
router.post('/register', userValidator.checkChain(), async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    ResHelper.RenderRes(res, false, result.errors);
    return;
  }
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: ["user"]
    })
    await newUser.save();
    ResHelper.RenderRes(res, true, newUser.getJWT())
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});

router.post("/forgotPassword", async function (req, res, next) {
  var user = await userModel.findOne({
    email: req.body.email
  })
  if (user) {
    let token = user.genTokenResetPassword();
    await user.save()
    try {
      let url = `https://${config.hostName}/api/v1/auth/ResetPassword/${token}`;
      let message = `click zo url de reset passs: ${url}`
      sendmail(message, user.email)
      ResHelper.RenderRes(res, true, "Thanh cong");
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExp = undefined;
      await user.save();
      ResHelper.RenderRes(res, false, error);
    }
  } else {
    ResHelper.RenderRes(res, false, "email khong ton tai");
  }
})

router.post("/ResetPassword/:token",  async function (req, res, next) {
  var user = await userModel.findOne({
    resetPasswordToken: req.params.token
  })
  if (user) {
    if (user.resetPasswordExp > Date.now()) {
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExp = undefined;
      await user.save();
      ResHelper.RenderRes(res, true, "Reset thanh cong");
    } else {
      ResHelper.RenderRes(res, false, "URL het han");
    }
  } else {
    ResHelper.RenderRes(res, false, "URL khong hop le");
  }
})

router.post("/changePasswordToken",userValidator.checkIsEmail(), async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    ResHelper.RenderRes(res, false, result.errors);
    return;
  }
  var user = await userModel.findOne({
    email: req.body.email
  })
  if (user) {
    let token = user.genTokenResetPassword();
    await user.save()
    try {
      let url = `http://${config.hostName}/api/v1/auth/ChangePassword/${token}`;
      let message = `click zo url de reset passs: ${url}`
      sendmail(message, user.email)
      ResHelper.RenderRes(res, true, "Thanh cong");
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExp = undefined;
      await user.save();
      ResHelper.RenderRes(res, false, error);
    }
  } else {
    ResHelper.RenderRes(res, false, "email khong ton tai");
  }

})

router.post("/ChangePassword/:token",checkLogin,userValidator.checkStrongPassword(), async function (req, res, next) {
  var user = await userModel.findOne({
    resetPasswordToken: req.params.token
  })
  if (user) {
    var result = validationResult(req);
    if (result.errors.length > 0) {
      ResHelper.RenderRes(res, false, result.errors);
      return;
    }
    if (user.resetPasswordExp > Date.now()) {
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExp = undefined;
      await user.save();
      ResHelper.RenderRes(res, true, "Reset thanh cong");
    } else {
      ResHelper.RenderRes(res, false, "URL het han");
    }
  } else {
    ResHelper.RenderRes(res, false, "URL khong hop le");
  }

})

module.exports = router;
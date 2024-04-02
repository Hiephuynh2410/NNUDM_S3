var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var ResHelper = require('../helper/ResponseHelper');
var userValidator = require('../validators/user');
var { validationResult } = require('express-validator');
var checkLogin = require('../middlewares/checklogin')
var checkAuthorize = require('../middlewares/checkauthorize');

router.get('/', checkLogin, checkAuthorize("admin", "modifier", "user"), async function (req, res, next) {
  let users = await userModel.find({}).exec();
  ResHelper.RenderRes(res, true, users)
});

router.get('/:id', async function (req, res, next) {
  try {
    let user = await userModel.find({ _id: req.params.id }).exec();
    ResHelper.RenderRes(res, true, user)
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});

router.post('/', userValidator.checkChain(), async function (req, res, next) {
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
      role: req.body.role
    })
    await newUser.save();
    ResHelper.RenderRes(res, true, newUser)
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});
router.put('/:id', async function (req, res, next) {
  try {
    let user = await userModel.findById
      (req.params.id).exec()
    user.email = req.body.email;
    await user.save()
    ResHelper.RenderRes(res, true, user);
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});


router.delete('/:id', async function (req, res, next) {
  try {
    let user = await userModel.findByIdAndUpdate
      (req.params.id, {
        status: false
      }, {
        new: true
      }).exec()
    ResHelper.RenderRes(res, true, user);
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});

module.exports = router;
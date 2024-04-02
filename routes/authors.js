var express = require('express');
var router = express.Router();
var authorModel = require('../schemas/author')
var ResHelper = require('../helper/ResponseHelper');

router.get('/', async function (req, res, next) {
  let authors = await authorModel.find({}).populate('published')
    .exec();
  ResHelper.RenderRes(res, true, authors)
});

// router.get('/:id', async function (req, res, next) {
//   try {
//     let book = await bookModel.find({ _id: req.params.id }).exec();
//     ResHelper.RenderRes(res, true, book)
//   } catch (error) {
//     ResHelper.RenderRes(res, false, error)
//   }
// });

router.post('/', async function (req, res, next) {
  try {
    var newAuthor = new authorModel({
      name: req.body.name
    })
    await newAuthor.save();
    ResHelper.RenderRes(res, true, newAuthor)
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});
// router.put('/:id', async function (req, res, next) {
//   try {
//     let book = await bookModel.findByIdAndUpdate
//       (req.params.id, req.body, {
//         new: true
//       }).exec()
//     ResHelper.RenderRes(res, true, book);
//   } catch (error) {
//     ResHelper.RenderRes(res, false, error)
//   }
// });


// router.delete('/:id', async function (req, res, next) {
//   try {
//     let book = await bookModel.findByIdAndUpdate
//       (req.params.id, {
//         isDeleted: true
//       }, {
//         new: true
//       }).exec()
//     ResHelper.RenderRes(res, true, book);
//   } catch (error) {
//     ResHelper.RenderRes(res, false, error)
//   }
// });

module.exports = router;

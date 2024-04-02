var express = require('express');
var router = express.Router();
var bookModel = require('../schemas/book')
var ResHelper = require('../helper/ResponseHelper');
const { query } = require('express');

router.get('/', async function (req, res, next) {
  console.log(req.query);
  let exclude = ["sort", "page", "limit"];
  let stringArray = ["author", "name"];
  let numberArray = ["year"]
  let queries = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (!exclude.includes(key)) {
      if (stringArray.includes(key)) {
        queries[key] = new RegExp(value.replace(',', "|"), 'i');
      }
      if (numberArray.includes(key)) {
        console.log();
        var rex = new RegExp('lte"|gte"|lt"|gt"', 'i');
        var string = JSON.stringify(req.query[key]);
        let index = string.search(rex);
        if (index > -1) {
          var newvalue = string.slice(0, index) + '$' + string.slice(index);
          queries[key] = JSON.parse(newvalue);
        }else{
          queries[key]= value
        }
        
      }

    }
  }
  console.log(queries);
  let limit = req.query.limit ? req.query.limit : 5;
  let page = req.query.page ? req.query.page : 1;
  let sortQuery = {};
  if (req.query.sort) {
    if (req.query.sort.startsWith('-')) {
      let field = req.query.sort.substring(1, req.query.sort.length);
      sortQuery[field] = -1;
    } else {
      sortQuery[req.query.sort] = 1;
    }
  }
  let books = await bookModel.find(
    queries).populate({path:'author',select:"name"}).lean()
    .limit(limit)
    .skip((page - 1) * limit)
    .sort(sortQuery)
    .exec();
  ResHelper.RenderRes(res, true, books)
});

router.get('/:id', async function (req, res, next) {
  try {
    let book = await bookModel.find({ _id: req.params.id }).exec();
    ResHelper.RenderRes(res, true, book)
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});

router.post('/', async function (req, res, next) {
  try {
    var newbook = new bookModel({
      name: req.body.name,
      year: req.body.year,
      author: req.body.author
    })
    await newbook.save();
    ResHelper.RenderRes(res, true, newbook)
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});
router.put('/:id', async function (req, res, next) {
  try {
    let book = await bookModel.findByIdAndUpdate
      (req.params.id, req.body, {
        new: true
      }).exec()
    ResHelper.RenderRes(res, true, book);
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});


router.delete('/:id', async function (req, res, next) {
  try {
    let book = await bookModel.findByIdAndUpdate
      (req.params.id, {
        isDeleted: true
      }, {
        new: true
      }).exec()
    ResHelper.RenderRes(res, true, book);
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});

module.exports = router;

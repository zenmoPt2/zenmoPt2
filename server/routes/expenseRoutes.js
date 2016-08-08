"use strict"
const express     = require('express')
    , router      = express.Router()
    , expenseUtil = require('../util/expenseUtil.js')
    , tokenUtil   = require('../util/tokenUtil.js');

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Request at /expenses received!');
  next();
});

// get expenses
router.get('/', (req, res, next) => {
  let userID = tokenUtil.getUserIDFromToken(req.headers['x-access-token']);
  // get all expenses from DB and send response
  expenseUtil.getExpensesFromDB().then(expenses => res.send(expenses));
});

// send expenses, currently expects 'text/csv'
router.post('/', (req, res, next) => {
    console.log(req.headers);
    // check if proper request made
    if (req.body.expenses) {
      // add expenses to dB
      expenseUtil.addExpensesToDB(req.body.expenses)
      // send back expenses array as default response
      .then(success => expenseUtil.getExpensesFromDB())
      .catch(err => console.log('error in addExpensesToDB:', err))
      .then(expenses => res.status(201).send(expenses))
      .catch(err => console.log('Error in getExpensesFromDB:', err));
    } else {
      res.send('request body needs expenses!');
    }
});

// bulk update expenses
router.put('/', (req, res) => {
  // utility function to update category for an array of
  // expenses in expenses DB
  if (req.body.expenses) {
    let expenses = req.body.expenses;
    expenseUtil.bulkUpdateExpenseCategoriesinDB(expenses)
      .then(success => expenseUtil.getExpensesFromDB())
      .then(expenses => res.send(expenses));
  } else {
    res.send('request body needs expenses!');
  }
});

// update specific expense
router.put('/:id', (req, res) => {
  if (req.body.category) {
    let expenseId = req.url.slice(1);
    let category  = req.body.category;
    expenseUtil.updateExpenseCategoryinDB(expenseId, category)
       // send back expenses array as default response
      .then(success => expenseUtil.getExpensesFromDB())
      .then(expenses => res.send(expenses));
  } else {
    res.send('request body needs categories!');
  }
});

module.exports = router;

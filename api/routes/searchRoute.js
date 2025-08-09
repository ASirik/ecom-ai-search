const express = require("express");
const { nlpSearch } = require("../controllers/searchController");
const router = express.Router();
router.post("/nlp", nlpSearch);

module.exports = router;

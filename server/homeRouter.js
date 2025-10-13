const express = require("express");

const homeRouter = express.Router();

homeRouter.get("/", (_req, res) => {
  res.render("index.html.ejs");
});

module.exports = homeRouter;

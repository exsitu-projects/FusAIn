const express = require("express");
const assetsRouter = express.Router();

const supportedAssets = ["svg", "png", "jpg", "png", "jpeg", "mp4", "ogv"];

const assetExtensionRegex = () => {
  const formattedExtensionList = supportedAssets.join("|");

  return new RegExp(/\.(svg|png|jpg|jpeg|mp4|ogv)$/i);
};

assetsRouter.get(/\.(svg|png|jpg|jpeg|mp4|ogv)$/i, (req, res) => {
  console.log("image file detected");
  res.redirect(303, `http://localhost:5173/public${req.path}`);
});

module.exports = assetsRouter;

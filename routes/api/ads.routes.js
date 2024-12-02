// routes/api/ads.routes.js
const express = require('express');
const router = express.Router();
const { getAds } = require('../../controllers/ads.controller.js');

router.get('/', getAds);

module.exports = router;
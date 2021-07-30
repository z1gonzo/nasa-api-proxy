const express = require('express');
const axios = require('axios');
const { json } = require('express');
const rateLimit = require('express-rate-limit');
const slowDown = require("express-slow-down");


const limiter = rateLimit({
 windowMs: 30 * 1000, // 15 minutes
 max: 10
})

const speedLimiter = slowDown({
 windowMs: 30 * 1000,
 delayAfter: 1, // allow 1 requests per 15 minutes, then...
 delayMs: 500 // begin adding 500ms of delay per request above 100:
 // request # 101 is delayed by  500ms
 // request # 102 is delayed by 1000ms
 // request # 103 is delayed by 1500ms
 // etc.
});

const router = express.Router();

const BASE_URL = 'https://api.nasa.gov/insight_weather/?';

let cachedData;
let cacheTime;

router.get('/', limiter, speedLimiter, async (req, res, next) => {
 if (cacheTime && cacheTime > Date.now() - 30 * 10000) {
  return res.json(cachedData)
 }
 try {
  const params = new URLSearchParams({
   api_key: process.env.NASA_API_KEY,
   feedtype: 'json',
   ver: '1.0'
  })

  const { data } = await axios.get(`${BASE_URL}${params}`)

  cachedData = data;
  cacheTime = Date.now();

  return res.json(data);
 } catch (error) {
  return next(error)
 }

});

module.exports = router;
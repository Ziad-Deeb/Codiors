const requestIp = require("request-ip");
const { Request } = require("../models/index");

const trackingMiddleware = async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const startTime = Date.now(); // Start the timer

    // const headers = {};
    // Object.keys(req.headers).forEach((key) => {
    //   headers[key] = req.headers[key];
    // });

    let responseBody; // Initialize a variable to store the response body

    // Override the default write() method of the response object to capture the response body
    const originalWrite = res.write;
    const originalEnd = res.end;

    const chunks = [];

    res.write = function (chunk) {
      chunks.push(chunk);
      originalWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
      if (chunk) {
        chunks.push(chunk);
      }

      responseBody = Buffer.concat(chunks).toString("utf8"); // Convert the response body chunks to a string
      console.log(responseBody);

      originalEnd.apply(res, arguments);
    };

    res.on("finish", async () => {
      // Omit sensitive fields from the request body
      const { password, confirmPassword, confidentialField, ...sanitizedBody } =
        req.body;

      const request = await Request.create({
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        // headers,
        useragent: req.headers["user-agent"],
        requestBody: sanitizedBody, // Store the sanitized body without sensitive fields
        statusCode: res.statusCode, // Get the response status code
        responseTime: Date.now() - startTime, // Calculate the response time
        referrer: req.headers.referer,
        responseBody: responseBody,
      });
    });

    next();
  } catch (error) {
    console.error("Error tracking request:", error);
    next(error);
  }
};

module.exports = trackingMiddleware;

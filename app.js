require("dotenv").config();
require("express-async-errors");

// express
const express = require("express");
const app = express();

// database
const { sequelize } = require("./models");

// rest of the packages
const rateLimiter = require("express-rate-limit");
const bodyParser = require("body-parser");

//  routers
const authRouter = require("./routes/userAuthRoutes");
const userRouter = require("./routes/userRoutes");
const problemRouter = require("./routes/problemRoutes");
const tagRouter = require("./routes/tagRoutes");
const checkerRouter = require("./routes/checkerRoutes");
const programmingLanguageRouter = require("./routes/ProgrammingLanguageRoutes");
const testcaseRouter = require("./routes/testcaseRoutes");
const companyAuthRoutes = require("./routes/companyAuthRoutes");
const planRoutes = require('./routes/planRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const difficultyRoutes = require('./routes/difficultyRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const problemTagsRoutes = require('./routes/problemTagsRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const companyRoutes = require('./routes/companyRoutes');

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const trackingMiddleware = require("./middleware/trackingMiddleware");

app.set('trust proxy', 1);

// Configure rate limiter
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());

app.use(limiter);

app.use(trackingMiddleware);

app.use("/auth", authRouter);
app.use("/api/v1/auth/company", companyAuthRoutes);
app.use("/users", userRouter);
app.use("/problems", problemRouter);
app.use("/tags", tagRouter);
app.use("/checkers", checkerRouter);
app.use("/programmingLanguages", programmingLanguageRouter);
app.use("/problems/:problem_id/testcases", testcaseRouter);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/difficulties', difficultyRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/problem-tags', problemTagsRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/companies', companyRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;
const start = async () => {
  try {
    // await sequelize.sync({ force: false }); // Set force: true during development to drop and recreate tables
    // console.log("Database and tables created!");
    await sequelize.authenticate();
    console.log('Database connected...');
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

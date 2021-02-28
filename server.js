if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const test = require("./src/test/getData");

const {
  // authorize,
  errorHandler,
  notFound,
} = require("./src/utils/middlewares");
const bodyParser = require("body-parser");

const searchRoutes = require("./src/routes/search/searchRoutes");

const main = require("./src/routes/routes");

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.use("/api/", searchRoutes);
app.use("/api/", main);

//app.use("/api/account-management", authorize(), accountManagement);

/****************FILE SERVER*****************/
/***************ERRORS******************/
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening REST on port ${port}...`));

//Avoid server stopping when an uncaught exception (thrown) takes place
process.on("uncaughtException", (err) =>
  console.error(`[Uncaught exception] : ${err}`)
);

setTimeout(async () => {
  await test.test();
}, 1000);

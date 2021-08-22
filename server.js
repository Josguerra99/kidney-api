//Carga las variables de entorno (.env)
if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//Importar paquetes y crear la aplicacion
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const test = require("./src/test/getData");
const faker = require("faker");
const { errorHandler, notFound } = require("./src/utils/middlewares");
const bodyParser = require("body-parser");
const searchRoutes = require("./src/routes/search/searchRoutes");
const main = require("./src/routes/routes");

const app = express(); //Crea la aplicacion

//Se le dice a la aplicacion que use algunos paquetes
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: "*" }));

//CARGA LOS "MODULOS" CREADOS PARA KIDNEY
app.use("/api/", searchRoutes);
app.use("/api/", main);

/***************ERRORS******************/
app.use(notFound);
app.use(errorHandler);

//INICIAR EL SERVIDOR
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening REST on port ${port}...`));

process.on("uncaughtException", (err) =>
  console.error(`[Uncaught exception] : ${err}`)
);

// setTimeout(async () => {
//   await test.test();
// }, 1000);

// function randomData() {
//   faker.locale = "es_MX";
//   let p = {};
//   let gender = Math.random() < 0.5 ? "Female" : "Male";
//   p.name = faker.name.findName(null, null, gender);
//   p.address = faker.address.city() + " , " + faker.address.country();
//   p.sex = gender;
//   p.birthdate = faker.date.past(60);

//   p.dpi = faker.datatype
//     .number({ min: 1000000000000, max: 9999999999 })
//     .toString();
//   return p;
// }

// console.log(randomData());

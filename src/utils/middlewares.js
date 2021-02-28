// const { getMyAccountData } = require("../controller/accountData");

const UNAUTHORIZED = {
  status: 401,
  message: "UNAUTHORIZED",
};

const FORBIDDEN = {
  status: 403,
  message: "FORBIDDEN",
};

/**
 *
 * @param {import("express").RequestHandler} idRole
 */

// function authorize(idRole = null) {
//   return async function (req, res, next) {
//     if (!req.headers.authorization) {
//       return res.status(403).json(FORBIDDEN);
//     }
//     try {
//       const account = await getMyAccountData(req.headers.authorization);
//       res.locals.currentUser = account;
//       if (idRole == null || account.idRole === idRole) return next();
//       return res.status(401).json(UNAUTHORIZED);
//     } catch (error) {
//       return res.status(401).json(UNAUTHORIZED);
//     }
//   };
// }

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function notFound(req, res, next) {
  res.status(404).json({
    status: 404,
    message: `Not Found`,
    url: req.originalUrl,
  });
}

/**
 * @param {Error} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    status: statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "" : err.stack,
  });
}

module.exports = {
  // authorize,
  notFound,
  errorHandler,
};

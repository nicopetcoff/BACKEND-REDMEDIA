/**
 * @type {Module jsonwebtoken|Module jsonwebtoken}
 * @author | Mohammad Raheem
 */
var jwt = require('jsonwebtoken');
var config = require('../config').config();

var authorization = function (req, res, next) {

    var token = req.headers['x-access-token'];
    console.log("token",token);
    var msg = {auth: false, message: 'No token provided.'};
    if (!token)
        res.status(500).send(msg);

    let sec = process.env.SECRET;
    //console.log("secret",sec)
    jwt.verify(token, sec, function (err, decoded) {
        var msg = {auth: false, message: 'Failed to authenticate token.'};
        if (err)
        res.status(500).send(msg);
        req.userId = decoded.id;
        next();
    });
}

exports.verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"]; // O el encabezado que estés usando
  
    if (!token) {
      return res.status(403).send({ message: "No se proporcionó token!" });
    }
  
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "No autorizado!" });
      }
      req.user = decoded; // Guardar los datos del usuario en la solicitud
      next();
    });
  };

module.exports = authorization;


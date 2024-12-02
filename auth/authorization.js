var jwt = require('jsonwebtoken');
var config = require('../config').config();

var authorization = function (req, res, next) {
   var token = req.headers['x-access-token'];
   
   if (!token) {
       return res.status(500).send({auth: false, message: 'No token provided.'});
   }

   let sec = process.env.SECRET;
   
   try {
       const decoded = jwt.verify(token, sec);
       if (!decoded || !decoded.id) {
           return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
       }
       req.userId = decoded.id;
       next();
   } catch (err) {
       return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
   }
}

exports.verifyToken = (req, res, next) => {
   const token = req.headers["x-access-token"];
 
   if (!token) {
       return res.status(403).send({ message: "No se proporcionó token!" });
   }
 
   try {
       const decoded = jwt.verify(token, process.env.SECRET);
       req.user = decoded;
       next();
   } catch (err) {
       return res.status(401).send({ message: "No autorizado!" });
   }
};

module.exports = authorization;
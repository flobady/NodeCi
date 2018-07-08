const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  await next(); //pour dire au mmiddleware de tourner après la route handler et non pas avant. Une fois la requete exécutée, on va revenir ici!

  clearHash(req.user.id);
}

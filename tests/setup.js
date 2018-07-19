jest.setTimeout(30000); // tells jest how long it should wait before failing a single test, par défaut c'est 5secondes
require('../models/User');
const mongoose = require('mongoose');
const keys = require('../config/keys');

// !!! ON MODIFIE LE package.json pour que jest reconnaisse et exécute ce fichier!!!
// cf setupTestFrameworkScriptFile dans le package.json

mongoose.Promise = global.Promise; // par défaut on va utiliser l'implémentation des promise de node js
mongoose.connect(keys.mongoURI, { useMongoClient: true }); // pour éviter un deprecation warning

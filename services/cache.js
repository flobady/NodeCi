const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util'); //librairie standard de node
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget); // callback client.get(req.user.id, () => { }) c'est pas propre, redis ne retourne pas de promise donc pas de await directmenet, on doit utiliser le promisify
const exec = mongoose.Query.prototype.exec; //on va sur la fonction qui est appelé dés qu'on excéute qqch dans mongoose

mongoose.Query.prototype.cache = function(options = {}) { //ainsi les fonctions mongoose hérite de cache et on pourra appeler Blog.find({}).cache()
  this.useCache = true;   //on peut maintenant utiliser useCache plus base
  this.hashKey = JSON.stringify(options.key || ''); //le || permet d'éviter d'avoir "undefined" si on ne passe pas de key
  return this; //pour qu'on pouisse mettre le .cache() au milieu de la chaine .sort().cache().limit()
}

mongoose.Query.prototype.exec = async function () { // function et pas arrow function pour que this = la query
  console.log('IM ABOUT TO RUN A QUERY');

  if(!this.useCache)
  {
    return exec.apply(this, arguments);
  }
  // console.log(this.getQuery()) // return query options
  // console.log(this.mongooseCollection.name) // return collection name

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {  // on fait une copie du thisgetQuery car si on y touche directement en le mettant dans un string ça va modifier la fonction sous jacente // autrement dit on ne veut pas modifier l'objet retourner par getQuery pour ne pas modifierle getQuery// le premier argument est l'objet vide dans lequel on va mettre le getquery et la collection
      collection: this.mongooseCollection.name
    })
  );

  // see if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key); //hget pour les nested values

  // if yes, return it
  if(cacheValue) {

    const doc = JSON.parse(cacheValue) //mongoose veut un objet mongoose et non pas juste un json (on est au milieu de la query la, on ne peut pas elever tous les attributs mongoose comme ça) // this.model est le modèle qui représente la query ça équivaut à la syntaxe new Blog({ title: "toto"})
    return Array.isArray(doc) //cacheValue peut etre tantot un objet simple (user) et parfois un array (liste des blogposts)
       ? doc.map(d => new this.model(d))
       : new this.model(doc);
  }

  // else issue te query and store the result in redis
  const result = await exec.apply(this, arguments);// we execute the original exec function
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX',10); // on expire le cash après 10 secondes
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};

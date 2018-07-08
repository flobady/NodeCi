module.exports = {
  googleClientID:
    '964808011168-29vqsooppd769hk90kjbjm5gld0glssb.apps.googleusercontent.com',
  googleClientSecret: 'KnH-rZC23z4fr2CN4ISK4srN',
  mongoURI: 'mongodb://127.0.0.1:27017/blog_ci', // vient de la doc travis. L'instance de mongo sera dispo la et c'est tout. pas négociable. Si mongoose ne toruve pas la base blog_ci, il va la créer dans mongodb
  cookieKey: '123123123',
  redisUrl: 'redis://127.0.0.1:6379' //vient de la doc travis. Travis tourne sur local host et sur port6379
};

const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]); //on génère la signature pour que cookie session comprenne ce qu'on lui donne

module.exports = (user) => {
  //generate fake session object
  const sessionObject = {
    passport: {
      user: user._id.toString()
    }
  }

  //sessionString est notre session
  const session = Buffer.from(
    JSON.stringify(sessionObject))
  .toString('base64')

  const sig = keygrip.sign('session=' + session );

  return { session, sig };
};

// on enrichit la class Page de puppeteer pour pouvoir faire du page.logi

// SOLUTION 1
// const Page =  require('puppeteer/lib/Page');
// Page.prototype.login = async function() {
//   // const id = '5b0295c6d3746d0e53d9a3f3'; //user id vient de la bdd
//   const user = await userFactory();
//   const { session, sig } = sessionFactory(user);

//   //on va setter (sessionString, sig) dans les cookie de notre instance chromium
//   await this.setCookie({ name: 'session', value: session });
//   await this.setCookie({ name: 'session.sig', value: sig });

//   // on refresh pour que la page re render et on sera bien connecté à la ui, le logout apparaitre
//   await this.goto('localhost:3000');

//   await this.waitFor('a[href="/auth/logout"]'); // pour que pupetter laisse du temps à la page pour que ça se charge jusqu'à voir cet élément
// }


//SOLUTION 2
const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({ //ouverture browser grace à pupetter
        headless: false, //false => on veut voir la UI apparaitre, true, on ne verra pas la UI dans Chromium
        args: ['--no-sandbox']  //pour augmenter rapidité des tests de Travis
      });
    const page = await browser.newPage(); // on utiliser le browser pour créer une page
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        // l'ordre importe car on regarde d'abord les méthode de customPage puis celle de browser puis celle de page. la méthode close existe pour page et pour browser
        return customPage[property] || browser[property] || page[property] // avec toutes les instances de CustomPage ont acces aux methodes de page, browser et customPage
      }
    });
  }

  constructor(page) {
    this.page = page
  }

  async login() {
    const user = await userFactory(); // const id = '5b0295c6d3746d0e53d9a3f3'; //user id vient de la bdd
    const { session, sig } = sessionFactory(user);

    //on va setter (sessionString, sig) dans les cookie de notre instance chromium
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });

    // on refresh pour que la page re render et on sera bien connecté à la ui, le logout apparaitre
    await this.page.goto('localhost:3000/blogs');

    await this.page.waitFor('a[href="/auth/logout"]'); // pour que pupetter laisse du temps à la page pour que ça se charge jusqu'à voir cet élément
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate( _path => { //evaluate prend en argument path qu'on lui a donné en second argument
      return fetch(_path, {
        method:'GET',
        credentials: 'same-origin',
        header: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate((_path, _data)=>{
      return fetch(_path, {
        method:'POST',
        credentials: 'same-origin',
        header: {
          'Content-Type': 'application/json'
        },
          body: JSON.stringify(_data)
      }).then(res => res.json());
    }, path, data); //on passe data, qui sera évalué en string par evaluate de pupeter, qui l'éxécute dans Chromium
  }

  execRequests(actions) {
    return Promise.all( // promise.all permet d'attendre que toutes les promises soient résolues avant d'aller plus loin
      actions.map(({ method, path, data }) => {
        return this[method](path, data); //this fait ainsi référence à get ou post function défini plus haut // si pas de data ce sera undefined et pas de souci
      })
    );
  }
}

module.exports = CustomPage;

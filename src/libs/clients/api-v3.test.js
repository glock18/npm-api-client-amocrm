import _ from 'underscore';
import Requester from '../helpers/requester';
import AmoV3ApiClient from './api-v3';
import PromoClientClass from './promo';
import testConfig from '../../../config/test.js';

const amoApiClient = new AmoV3ApiClient(
    Requester,
    new PromoClientClass(Requester)
);

const subdomain = testConfig.subdomain;
const login = testConfig.login;
const key = testConfig.key;

it('Should work with customers list', () => {
  const promise = new Promise((resolve, reject) => {
    amoApiClient.auth(subdomain, login, key).then(() => {
      amoApiClient.listCustomers().then(resolve, reject);
    }, reject);
  });

  return promise.then((res) => {
    let customer;
    expect(res).toBeInstanceOf(Array);

    customer = _.first(res);
    expect(customer).toBeInstanceOf(Object);
    expect(customer).toHaveProperty('next_date');
  });
});

it('Should work with customers add', () => {
  const testElement = {
    name: 'Test',
    next_date: Math.round((+new Date) / 1000),
  };

  const promise = new Promise((resolve, reject) => {
    amoApiClient.auth(subdomain, login, key).then(() => {
      amoApiClient.addCustomers([testElement]).then(resolve, reject);
    }, reject);
  });

  return promise.then((res) => {
    let element;
    expect(res).toBeInstanceOf(Array);

    element = _.first(res);
    expect(element).toBeInstanceOf(Object);
    expect(element).toHaveProperty('id');
  }, (error) => console.log(error));
});

it('Should work with transactions list', () => {
  const promise = new Promise((resolve, reject) => {
    amoApiClient.auth(subdomain, login, key).then(() => {
      amoApiClient.listTransactions().then(resolve, reject);
    }, reject);
  });

  return promise.then((res) => {
    let transaction;
    expect(res).toBeInstanceOf(Object);

    transaction = _.first(_.toArray(res));
    expect(transaction).toBeInstanceOf(Object);
    expect(transaction).toHaveProperty('price');
  });
});

it('Should work with catalogs list', () => {
  const promise = new Promise((resolve, reject) => {
    amoApiClient.auth(subdomain, login, key).then(() => {
      amoApiClient.listCatalogs().then(resolve, reject);
    }, reject);
  });

  return promise.then((res) => {
    let catalog;
    expect(res).toBeInstanceOf(Object);

    catalog = _.first(_.toArray(res));
    expect(catalog).toBeInstanceOf(Object);
    expect(catalog).toHaveProperty('sort');
  });
});

it('Should work with catalogs add', () => {
  const testElement = {name: 'Test'};

  const promise = new Promise((resolve, reject) => {
    amoApiClient.auth(subdomain, login, key).then(() => {
      amoApiClient.addCatalogs([testElement]).then(resolve, reject);
    }, reject);
  });

  return promise.then((res) => {
    let element;
    expect(res).toBeInstanceOf(Array);

    element = _.first(res);
    expect(element).toHaveProperty('id');
  }, (error) => console.log(error));
});

it('Should work with catalog_elements list', () => {
  const promise = new Promise((resolve, reject) => {
    amoApiClient.auth(subdomain, login, key).then(() => {
      amoApiClient.listCatalogElements().then(resolve, reject);
    }, reject);
  });

  return promise.then((res) => {
    let catalogElement;
    expect(res).toBeInstanceOf(Array);

    catalogElement = _.first(res);
    expect(catalogElement).toBeInstanceOf(Object);
    expect(catalogElement).toHaveProperty('catalog_id');
  }, (err) => console.log(typeof err === 'object' ? JSON.stringify(err) : err));
});

it('Should work with links', () => {
  const promise = new Promise((resolve, reject) => {
    amoApiClient.auth(subdomain, login, key).then(() => {
      const getEntities = [
        amoApiClient.listCustomers({limit_rows: 1}),
        amoApiClient.listContacts({limit_rows: 1}),
      ];

      Promise.all(getEntities).then((entities) => {
        const customer = _.first(entities[0]);
        const contact = _.first(entities[1]);
        let link;

        expect(customer).toBeInstanceOf(Object);
        expect(contact).toBeInstanceOf(Object);

        link = {
          from: 'customers',
          from_id: customer.id,
          to: 'contacts',
          to_id: contact.id,
        };

        amoApiClient.linkLinks([link]).then((links) => {
          const createdLink = _.first(links);

          expect(createdLink).toMatchObject(link);

          amoApiClient.listLinks([link]).then((links) => {
            const linkFromGet = _.first(links);

            expect(linkFromGet).toMatchObject(link);

            amoApiClient.unlinkLinks([link]).then(resolve, reject);
          }, reject);
        }, reject);
      }, reject);
    }, reject);
  });

  return promise.then((res) => {
    expect(res).toBeInstanceOf(Array);
    expect(res[0]).toBe(true);
  }, (err) => console.log(typeof err === 'object' ? JSON.stringify(err) : err));
}, 10000);

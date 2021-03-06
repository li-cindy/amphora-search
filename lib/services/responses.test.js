'use strict';

const _ = require('lodash'),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  expect = require('chai').expect,
  sinon = require('sinon'),
  createRes = require('../../test/mocks/res'),
  setup = require('../setup');

describe(_.startCase(filename), function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(setup.options.sites, 'getSiteFromPrefix');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('expectJSON', function () {
    const fn = lib[this.title],
      func = sinon.stub(),
      res = {
        json: _.noop,
        send: _.noop
      };

    it('sends back JSON when the function resolves', function () {
      const resolution = {prop: 'value'};

      func.returns(Promise.resolve(resolution));
      sandbox.stub(res, 'json');
      fn(func, res);
      expect(res.json.calledWith(resolution));
    });

    it('errors', function () {
      const resolution = new Error('An error occured');

      func.returns(Promise.reject(resolution));
      sandbox.stub(res, 'send');
      fn(func, res);
      expect(res.send.calledWith(resolution.stack));
    });
  });


  describe('redirectToLogin', function () {
    const fn = lib[this.title];

    it('calls res.redirect', function () {
      const res = createRes();

      setup.options.sites.getSiteFromPrefix.returns({prefix: 'site.com', port: 3001});
      fn({uri: 'site.com/path/_search'}, res);
      expect(res.redirect.calledOnce).to.be.true;
    });

    it('uses port 80 if one is not defined', function () {
      const res = createRes();

      setup.options.sites.getSiteFromPrefix.returns({prefix: 'site.com'});
      fn({uri: 'site.com/path/_search'}, res);
      expect(res.redirect.calledOnce).to.be.true;
    });
  });
});

import { expect, use } from 'chai';
import * as chaiString from 'chai-string';
import * as fs from 'fs';
import * as path from 'path';

use(chaiString);

describe(`sample-custom-node-resolve`, () => {
  describe(`sample-custom-node-resolve.metadata.json`, () => {
    let METADATA;
    before(() => {
      METADATA = require('../dist/sample-custom-node-resolve.metadata.json');
    });

    it(`should exist`, () => {
      expect(METADATA).to.be.ok;
    });

    it(`should be version 4`, () => {
      expect(METADATA.version).to.equal(4);
    });

    it(`should be "__symbolic": "module"`, () => {
      expect(METADATA['__symbolic']).to.equal('module');
    });

    it(`should "importAs": "sample-custom-node-resolve"`, () => {
      expect(METADATA['importAs']).to.equal('sample-custom-node-resolve');
    });

    it(`should inline "templateUrl" and "styleUrls"`, () => {
      const foo = METADATA['metadata']['FooComponent']['decorators'][0]['arguments'][0];

      expect(foo).to.be.ok;
      expect(foo.selector).to.equal('custom-foo');
      expect(foo.template).to.contain('<h1>Foo!</h1>');
      expect(foo.styles[0]).to.containIgnoreSpaces('h1 {');
      expect(foo.styles[0]).to.containIgnoreSpaces('color: #ff0000; }');
    });

    describe(`BazComponent`, () => {
      let baz;
      before(() => {
        baz = METADATA['metadata']['BazComponent']['decorators'][0]['arguments'][0];
      });

      it(`should be exported`, () => {
        expect(baz).to.be.ok;
      });

      it(`should have the <h1> template inlined`, () => {
        expect(baz.template).to.satisfy(str => str.startsWith(`<h1 class="supersized">Baz!</h1>`));
      });

      it(`should have a styles array with two stylesheets`, () => {
        expect(baz.styles)
          .to.be.an('array')
          .that.has.length(2);
      });
    });

    it(`should contain scss-rendered styles`, () => {
      const foo = METADATA['metadata']['FooComponent']['decorators'][0]['arguments'][0];

      expect(foo).to.be.ok;
      expect(foo.styles[0]).to.containIgnoreSpaces(`color: #ff0000`);
      expect(foo.styles[0]).to.not.contain(`$color: #ff0000`);
    });

    it(`should contain less-rendered styles`, () => {
      const baz = METADATA['metadata']['BazComponent']['decorators'][0]['arguments'][0];

      expect(baz).to.be.ok;
      expect(baz.styles[0]).to.containIgnoreSpaces(`color: #ff0000`);
      expect(baz.styles[0]).to.not.contain(`@red: #ff0000`);
    });

    describe(`stylus styles`, () => {
      it(`should contain rendered styles`, () => {
        const fooBar = METADATA['metadata']['FooBarComponent']['decorators'][0]['arguments'][0];

        expect(fooBar).to.be.ok;
        expect(fooBar.styles[0]).to.containIgnoreSpaces(`color: #f00;`);
        expect(fooBar.styles[0]).to.not.contain(`color: $color`);
      });

      it(`should contain imported styles`, () => {
        const fooBar = METADATA['metadata']['FooBarComponent']['decorators'][0]['arguments'][0];

        expect(fooBar).to.be.ok;
        expect(fooBar.styles[0]).to.containIgnoreSpaces(`background-color: #008000;`);
        expect(fooBar.styles[0]).to.not.contain(`background-color: $color-green;`);
      });

      it(`should contain imported image path`, () => {
        const fooBar = METADATA['metadata']['FooBarComponent']['decorators'][0]['arguments'][0];

        expect(fooBar).to.be.ok;
        expect(fooBar.styles[0]).to.containIgnoreSpaces(`background-image: url("../styles/assets/test.png");`);
        expect(fooBar.styles[0]).to.not.contain(`background-color: url(./assets/test.png);`);
      });
    });

    it(`should re-export 'InternalService' with an auto-generated symbol`, () => {
      expect(METADATA['metadata']['ɵa']).to.be.ok;
      expect(METADATA['origins']['ɵa']).to.equal('./internal.service');
    });
  });
});

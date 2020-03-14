describe('lodash', () => {
  const lodash = require('../lib/lodash');

  it('should have the right interpolation settings', () => {
    let template = lodash.template('{{ foo }}')({ foo: 'banana' });
    template.should.equal('banana');
  });

  it('should be an isolated instance of lodash', () => {
    lodash.should.not.equal(require('lodash'));
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Helper | metric-format', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders with serialized metric object', async function(assert) {
    assert.expect(7);
    this.set('metric', {
      field: 'revenue',
      parameters: { currency: 'USD', as: 'revenueUSD' }
    });

    await render(hbs`{{metric-format this.metric}}`);
    assert.dom().hasText('Revenue (USD)');

    this.set('metric', {
      field: 'revenue',
      parameters: { currency: 'CAD', as: 'revenueUSD' }
    });
    assert.dom().hasText('Revenue (CAD)');

    this.set('metric', { field: 'revenue' });
    assert.dom().hasText('Revenue');

    this.set('metric', { field: null });
    assert.dom().hasText('--');

    this.set('metric', null);
    assert.dom().hasText('--');

    this.set('metric', { field: '' });
    assert.dom().hasText('--');

    this.set('metric', { field: 'foo' });
    assert.dom().hasText('foo');
  });

  test('multi-datasource support', async function(assert) {
    assert.expect(3);
    const metaData = this.owner.lookup('service:navi-metadata');
    metaData.keg.reset();
    await metaData.loadMetadata({ dataSourceName: 'bardTwo' });

    this.set('metric', {
      field: 'usedAmount',
      parameters: {}
    });

    this.set('namespace', 'bardTwo');
    await render(hbs`{{metric-format this.metric this.namespace}}`);
    assert.dom().hasText('Used Amount', 'metric is looked up and rendered');

    this.set('metric', {
      field: 'navClicks',
      parameters: {}
    });
    assert.dom().hasText('navClicks', 'Fall back works');

    this.set('namespace', undefined);
    assert.dom().hasText('navClicks', 'default works if datasource is not loaded');

    metaData.keg.reset();
  });
});

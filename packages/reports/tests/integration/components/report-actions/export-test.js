import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-data/utils/classes/interval';
import $ from 'jquery';
import moment from 'moment';

const TEMPLATE = hbs`
    {{#report-actions/export
        report=report
    }}
        Export
    {{/report-actions/export}}
    `;

let Store;

module('Integration | Component | report actions - export', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
  });

  test('Component Renders', async function(assert) {
    assert.expect(4);

    const factService = this.owner.lookup('service:navi-facts');
    this.owner.lookup('service:navi-metadata').loadMetadata();
    const report = Store.findRecord('report', 1);

    this.set('report', report);
    await render(TEMPLATE);

    const component = $('a.report-control').get(0);

    assert.equal(component.text.trim(), 'Export', 'Component yields content as expected');

    assert.equal(component.getAttribute('target'), '_blank', 'Component has target attribute as _blank');

    assert.equal(component.getAttribute('download'), 'true', 'Component has download attribute as true');

    const expectedHref = factService.getURL(report.get('request').serialize(), {
      format: 'csv'
    });
    assert.equal(component.getAttribute('href'), expectedHref, 'Component has appropriate link to API');
  });

  test('Component is not disabled for unsaved reports', async function(assert) {
    assert.expect(1);

    run(() => {
      let request = {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        intervals: [
          Store.createFragment('bard-request/fragments/interval', {
            interval: new Interval(moment('10-02-2015', 'MM-DD-YYYY'), moment('10-14-2015', 'MM-DD-YYYY'))
          })
        ]
      };
      this.set('report', Store.createRecord('report', { title: 'New Report', request }));
    });

    await render(TEMPLATE);

    assert.notOk(!!$('a.report-control.disabled').length, 'Component is not disabled for unsaved reports');
  });
});

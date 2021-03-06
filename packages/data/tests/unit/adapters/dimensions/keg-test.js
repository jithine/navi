import EmberObject from '@ember/object';
import { assign } from '@ember/polyfills';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import metadataRoutes from 'navi-data/test-support/helpers/metadata-routes';
import Pretender from 'pretender';

const Response1 = {
  rows: [
    { id: 1, description: 'foo', meta: 'ember' },
    { id: 2, description: 'bar', meta: 'bard' },
    { id: 3, description: 'gar', meta: 'navi' }
  ]
};

const MetaObj = {
  meta: {
    pagination: {
      rowsPerPage: 3,
      numberOfResults: 3,
      currentPage: 1
    }
  }
};

const Response2 = assign(MetaObj, Response1);

const Record1 = { id: 1, description: 'foo', meta: 'ember' },
  Record2 = { id: 2, description: 'bar', meta: 'bard' },
  Record3 = { id: 3, description: 'gar', meta: 'navi' },
  Records = [Record1, Record2, Record3];

let Adapter, Keg, Server;

module('Unit | Adapters | Dimensions | Keg', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('model:dimension/bardOne.dimensionOne', EmberObject.extend({ name: 'dimensionOne' }));
    this.owner.register('model:dimension/bardTwo.dimensionFour', EmberObject.extend({ name: 'dimensionFour' }));

    Adapter = this.owner.lookup('adapter:dimensions/keg');

    Keg = Adapter.keg;
    Keg.pushMany('dimension/bardOne.dimensionOne', Records, { namespace: 'bardOne' });
    Keg.pushMany(
      'dimension/bardTwo.dimensionFour',
      [
        { id: 1, description: 'one' },
        { id: 2, description: 'two' }
      ],
      {
        namespace: 'bardTwo'
      }
    );

    //Load metadata
    Server = new Pretender(metadataRoutes);
    metadataRoutes.bind(Server)(1);

    return Promise.all([
      this.owner.lookup('service:navi-metadata').loadMetadata(),
      this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardTwo' })
    ]);
  });

  hooks.afterEach(function() {
    Server.shutdown();
  });

  test('_buildResponse', function(assert) {
    assert.expect(2);

    assert.deepEqual(
      Adapter._buildResponse(Records),
      Response1,
      '_buildResponse correctly built the response for the provided records'
    );

    assert.deepEqual(
      Adapter._buildResponse(Records, { page: 1, perPage: 3 }),
      Response2,
      '_buildResponse correctly built the response with pagination options for the provided records'
    );
  });

  test('all', async function(assert) {
    assert.expect(3);

    const result = await Adapter.all('dimensionOne');
    assert.deepEqual(
      result.rows.mapBy('id'),
      [1, 2, 3],
      'all() contains the expected response object for Test dimension without any filters'
    );

    const bardTwoResult = await Adapter.all('dimensionFour', { dataSourceName: 'bardTwo' });
    assert.deepEqual(
      bardTwoResult.rows.mapBy('id'),
      [1, 2],
      'all() contains the expected response object for bardTwo dimension without any filters'
    );

    const nonFoundResult = await Adapter.all('dimensionFour');
    assert.deepEqual(nonFoundResult.rows.mapBy('id'), [], "all() returns empty array when dimension can't be found");
  });

  test('find', async function(assert) {
    assert.expect(9);

    const assertThrowOperator = query => {
      assert.throws(
        () => {
          Adapter.find('dimensionOne', query);
        },
        /Only 'in' operation is currently supported in Keg/,
        'throws error when doing a contains search, which is not supported yet'
      );
    };
    assertThrowOperator({ operator: 'contains' });
    assertThrowOperator([{ operator: 'contains' }]);
    assertThrowOperator([{}, { operator: 'in' }, { operator: 'contains' }]);

    const assertEquals = (expected, message) => result => {
      assert.deepEqual(result.rows.mapBy('id'), expected, message);
    };

    await Adapter.find('dimensionOne', {
      field: 'description',
      values: 'bar,gar'
    }).then(assertEquals([2, 3], 'find() returns expected when values is a string'));
    await Adapter.find('dimensionOne', [
      {
        field: 'description',
        values: 'bar,gar'
      }
    ]).then(assertEquals([2, 3], 'find() returns expected when passed an array of queries'));
    await Adapter.find('dimensionOne', [
      {
        field: 'description',
        values: ['bar', 'gar']
      }
    ]).then(assertEquals([2, 3], 'find() returns expected when values is an array'));
    await Adapter.find('dimensionOne', [
      { field: 'id', values: [1, 2, 3] },
      { field: 'description', values: ['bar'] }
    ]).then(assertEquals([2], 'find() returns expected when passed multiple filters'));
    await Adapter.find('dimensionOne', [
      { field: 'id', values: [1, 2, 3] },
      { field: 'id', values: [3, 4] },
      { field: 'description', values: ['bar', 'gar'] }
    ]).then(assertEquals([3], 'find() returns expected when passed multiple overlapping filters'));

    await Adapter.find('dimensionFour', [{ field: 'description', values: ['two'] }], {
      dataSourceName: 'bardTwo'
    }).then(assertEquals([2], 'find() returns expected when using a dimension from a different data source'));
  });

  test('findById', async function(assert) {
    assert.expect(2);

    const result = await Adapter.findById('dimensionOne', '1');
    assert.deepEqual(
      result.id,
      1,
      'findById() returns the expected response object for Test dimension, identifierField and query'
    );

    const bardTwoResult = await Adapter.findById('dimensionFour', '1', 'bardTwo');
    assert.deepEqual(
      bardTwoResult.description,
      'one',
      'findById() returns the expected response object for the bardTwo sourced dimension'
    );
  });

  test('getById', function(assert) {
    assert.expect(4);

    assert.deepEqual(
      Adapter.getById('unknownDimensionName', '1'),
      undefined,
      'getById() returns undefined for an unknown dimension'
    );

    assert.deepEqual(
      Adapter.getById('dimensionOne', 'unkownDimensionId'),
      undefined,
      'getById() returns undefined for an known dimension with an unknown id'
    );

    assert.deepEqual(
      Adapter.getById('dimensionOne', '1').id,
      1,
      'getById() returns the expected response object for Test dimension, identifierField and query'
    );

    assert.deepEqual(
      Adapter.getById('dimensionFour', '1', 'bardTwo').description,
      'one',
      'getById() returns the expected response object from a dimension in another namespace'
    );
  });

  test('pushMany', function(assert) {
    assert.expect(4);
    Adapter.pushMany('dimensionOne', [
      { id: 22, foo: 'bar' },
      { id: 44, foo: 'baz' }
    ]);
    Adapter.pushMany(
      'dimensionFour',
      [
        { id: 77, foo: 'quux' },
        { id: 99, foo: 'plugh' }
      ],
      {
        dataSourceName: 'bardTwo'
      }
    );

    let { foo: bar } = Keg.getById('dimension/bardOne.dimensionOne', 22, 'bardOne');
    assert.deepEqual(bar, 'bar', 'pushMany stores records into the keg');

    let { foo: baz } = Keg.getById('dimension/bardOne.dimensionOne', 44, 'bardOne');
    assert.deepEqual(baz, 'baz', 'pushMany stores records into the keg');

    let { foo: quux } = Keg.getById('dimension/bardTwo.dimensionFour', 77, 'bardTwo');
    assert.deepEqual(quux, 'quux', 'pushMany stores records into the keg from different datasource');

    let { foo: plugh } = Keg.getById('dimension/bardTwo.dimensionFour', 99, 'bardTwo');
    assert.deepEqual(plugh, 'plugh', 'pushMany stores records into the keg from different datasource');
  });
});

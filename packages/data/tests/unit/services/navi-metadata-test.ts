import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import config from 'ember-get-config';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import TableMetadataModel from 'navi-data/models/metadata/table';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import ElideTwoScenario from 'navi-data/mirage/scenarios/elide-two';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import MetricMetadataModel from 'navi-data/models/metadata/metric';
import TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import ColumnFunctionMetadataModel from 'navi-data/models/metadata/column-function';
import { Server } from 'miragejs';

interface Context extends TestContext {
  server: Server;
  service: NaviMetadataService;
}

module('Unit | Service | navi-metadata', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(function(this: Context) {
    ElideTwoScenario(this.server);
    this.service = this.owner.lookup('service:navi-metadata');
  });

  hooks.afterEach(function(this: Context) {
    this.server.shutdown();
  });

  test('loadMetadata - bard', async function(this: Context, assert) {
    const keg = this.service['keg'];

    assert.equal(this.service.loadedDataSources.size, 0, '`bardTwo` data source is initially not loaded');
    await this.service.loadMetadata({ dataSourceName: 'bardTwo' });

    const tables = keg.all('metadata/table', 'bardTwo');
    assert.ok(
      tables.every(table => table instanceof TableMetadataModel),
      '`bardTwo` `TableMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(tables.mapBy('id'), ['inventory'], 'All `bardTwo` tables are loaded');

    const dimensions = keg.all('metadata/dimension', 'bardTwo');
    assert.ok(
      dimensions.every(dim => dim instanceof DimensionMetadataModel),
      '`bardTwo` `DimensionMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(
      dimensions.mapBy('id'),
      ['item', 'container', 'location', 'requirement', 'recipe', 'displayCurrency', 'eventId', 'parentEventId'],
      'All `bardTwo` dimensions are loaded'
    );

    const timeDimensions = keg.all('metadata/timeDimension', 'bardTwo');
    assert.ok(
      timeDimensions.every(dim => dim instanceof TimeDimensionMetadataModel),
      '`bardTwo` `TimeDimensionMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(timeDimensions.mapBy('id'), ['inventory.dateTime'], 'All `bardTwo` time dimensions are loaded');

    const metrics = keg.all('metadata/metric', 'bardTwo');
    assert.ok(
      metrics.every(metric => metric instanceof MetricMetadataModel),
      '`bardTwo` `MetricMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(
      metrics.mapBy('id'),
      ['ownedQuantity', 'usedAmount', 'personalSold', 'available', 'globallySold', 'revenue'],
      'All `bardTwo` metrics are loaded'
    );

    const columnFunctions = keg.all('metadata/columnFunction', 'elideTwo');
    assert.ok(
      columnFunctions.every(fn => fn instanceof ColumnFunctionMetadataModel),
      '`bardTwo` `ColumnFunctionMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(columnFunctions.mapBy('id'), [], 'All `bardTwo` column functions are loaded');

    assert.ok(this.service.loadedDataSources.has('bardTwo'), '`bardTwo` data source is loaded');
  });

  test('loadMetadata - elide', async function(this: Context, assert) {
    const keg = this.service['keg'];

    assert.equal(this.service.loadedDataSources.size, 0, '`elideTwo` data source is initially not loaded');
    await this.service.loadMetadata({ dataSourceName: 'elideTwo' });

    const tables = keg.all('metadata/table', 'elideTwo');
    assert.ok(
      tables.every(table => table instanceof TableMetadataModel),
      '`elideTwo` `TableMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(tables.mapBy('id'), ['table0', 'table1'], 'All `elideTwo` tables are loaded');

    const dimensions = keg.all('metadata/dimension', 'elideTwo');
    assert.ok(
      dimensions.every(dim => dim instanceof DimensionMetadataModel),
      '`elideTwo` `DimensionMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(
      dimensions.mapBy('id'),
      [
        'table0.dimension0',
        'table0.dimension1',
        'table1.dimension2',
        'table1.dimension3',
        'table1.dimension4',
        'table1.dimension5'
      ],
      'All `elideTwo` dimensions are loaded'
    );

    const timeDimensions = keg.all('metadata/timeDimension', 'elideTwo');
    assert.ok(
      timeDimensions.every(dim => dim instanceof TimeDimensionMetadataModel),
      '`elideTwo` `TimeDimensionMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(
      timeDimensions.mapBy('id'),
      [
        'table1.eventTimeHour',
        'table1.orderTimeHour',
        'table1.eventTimeDay',
        'table1.orderTimeDay',
        'table1.eventTimeWeek',
        'table1.orderTimeWeek',
        'table1.eventTimeMonth',
        'table1.orderTimeMonth',
        'table1.eventTimeQuarter',
        'table1.orderTimeQuarter',
        'table1.eventTimeYear',
        'table1.orderTimeYear'
      ],
      'All `elideTwo` time dimensions are loaded'
    );

    const metrics = keg.all('metadata/metric', 'elideTwo');
    assert.ok(
      metrics.every(metric => metric instanceof MetricMetadataModel),
      '`elideTwo` `MetricMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(
      metrics.mapBy('id'),
      ['table0.metric0', 'table1.metric1', 'table1.metric2'],
      'All `elideTwo` metrics are loaded'
    );

    const columnFunctions = keg.all('metadata/columnFunction', 'elideTwo');
    assert.ok(
      columnFunctions.every(fn => fn instanceof ColumnFunctionMetadataModel),
      '`elideTwo` `ColumnFunctionMetadataModel`s are loaded into the keg'
    );
    assert.deepEqual(
      columnFunctions.mapBy('id'),
      [
        'normalizer-generated:timeGrain(column=table1.eventTimeHour;grains=hour)',
        'normalizer-generated:timeGrain(column=table1.orderTimeHour;grains=hour)',
        'normalizer-generated:timeGrain(column=table1.eventTimeDay;grains=day)',
        'normalizer-generated:timeGrain(column=table1.orderTimeDay;grains=day)',
        'normalizer-generated:timeGrain(column=table1.eventTimeWeek;grains=week)',
        'normalizer-generated:timeGrain(column=table1.orderTimeWeek;grains=week)',
        'normalizer-generated:timeGrain(column=table1.eventTimeMonth;grains=month)',
        'normalizer-generated:timeGrain(column=table1.orderTimeMonth;grains=month)',
        'normalizer-generated:timeGrain(column=table1.eventTimeQuarter;grains=quarter)',
        'normalizer-generated:timeGrain(column=table1.orderTimeQuarter;grains=quarter)',
        'normalizer-generated:timeGrain(column=table1.eventTimeYear;grains=year)',
        'normalizer-generated:timeGrain(column=table1.orderTimeYear;grains=year)'
      ],
      'All `elideTwo` column functions are loaded'
    );

    assert.ok(this.service.loadedDataSources.has('elideTwo'), '`elideTwo` data source is loaded');
  });

  test('loadMetadata - default data source', async function(this: Context, assert) {
    assert.notOk(this.service.loadedDataSources.has('bardOne'), '`bardOne` data source is initially not loaded');
    await this.service.loadMetadata();
    assert.ok(this.service.loadedDataSources.has('bardOne'), 'default data source is loaded');
  });

  test('loadMetadata - multiple calls', async function(this: Context, assert) {
    assert.expect(1);

    this.server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    this.server.get('/tables', function() {
      assert.ok(true, 'initial metadata load executes a request');
      return { tables: [] };
    });
    await this.service.loadMetadata();

    this.server.get('/tables', function() {
      assert.notOk(true, 'after metadata is loaded, a fetch request is not executed');
      return { tables: [] };
    });
    await this.service.loadMetadata();
  });

  test('all', async function(this: Context, assert) {
    await this.service.loadMetadata({ dataSourceName: 'bardTwo' });
    await this.service.loadMetadata({ dataSourceName: 'elideTwo' });

    const bardTwoTables = this.service.all('table', 'bardTwo');
    assert.deepEqual(bardTwoTables.mapBy('id'), ['inventory'], '`all` returns all `bardTwo` tables');

    const elideTwoTables = this.service.all('table', 'elideTwo');
    assert.deepEqual(elideTwoTables.mapBy('id'), ['table0', 'table1'], '`all` return all `elideTwo` tables');

    const allTables = this.service.all('table');
    assert.deepEqual(
      allTables.mapBy('id'),
      ['inventory', 'table0', 'table1'],
      '`all` returns all loaded tables when data source is not specified'
    );
    assert.ok(
      allTables.every(table => table instanceof TableMetadataModel),
      'All returns instances of `TableMetadataModel`s'
    );

    assert.throws(
      () => this.service.all('table', 'notLoaded'),
      /Metadata must have the requested data source loaded: notLoaded/,
      '`all` throws an error if attempting to get all models from a data source that is not loaded'
    );
  });

  test('getById', async function(this: Context, assert) {
    await this.service.loadMetadata({ dataSourceName: 'elideTwo' });
    await this.service.loadMetadata({ dataSourceName: 'bardTwo' });

    const metricOne = this.service.getById('metric', 'table1.metric1', 'elideTwo');
    assert.ok(
      metricOne instanceof MetricMetadataModel,
      '`getById` returns a loaded instance of `MetricMetadataModel` when requesting `metric` type'
    );
    assert.equal(metricOne?.name, 'Metric 1', '`getById returns a metadata model given a type, id, & datasource');

    const revenue = this.service.getById('metric', 'revenue', 'bardTwo');
    assert.ok(
      revenue instanceof MetricMetadataModel,
      '`getById` returns a loaded instance of `MetricMetadataModel` when requesting `metric` type'
    );
    assert.equal(revenue?.name, 'Revenue', '`getById returns a metadata model given a type, id, & datasource');

    const missing = this.service.getById('metric', 'not a metric', 'bardTwo');
    assert.equal(missing, undefined, '`getById returns `undefined` if a model by `id` cannot be found');

    const notLoaded = this.service.getById('table', 'table0', 'notLoaded');
    assert.equal(notLoaded, undefined, '`getById` returns `undefined` when data source is not loaded');
  });

  test('fetchById - elide', async function(this: Context, assert) {
    assert.rejects(
      this.service.fetchById('metric', 'metric1', 'elideTwo'),
      /Type requested in ElideMetadataAdapter must be defined as a query in the gql\/metadata-queries.js file/,
      '`fetchById` elide throws an error if attempting to get a model by id'
    );
  });

  test('fetchById - fili', async function(this: Context, assert) {
    const metric = await this.service.fetchById('metric', 'revenue', 'bardTwo');
    assert.ok(
      metric instanceof MetricMetadataModel,
      '`getById` returns an instance of `MetricMetadataModel` when requesting `metric` type'
    );
    assert.equal(metric?.name, 'Revenue', '`getById returns a metadata model given a type, id, & datasource');

    const dimension = await this.service.fetchById('dimension', 'currency', 'bardOne');
    assert.ok(
      dimension instanceof DimensionMetadataModel,
      '`getById` returns an instance of `DimensionMetadataModel` when requesting `dimension` type'
    );
    assert.equal(dimension?.name, 'Currency', '`getById returns a metadata model given a type, id, & datasource');

    const columnFunction = await this.service.fetchById('columnFunction', 'currency', 'bardOne');
    assert.equal(columnFunction, undefined, '`getById returns `undefined` if a model `id` cannot be found');
  });

  test('findById', async function(this: Context, assert) {
    assert.equal(this.service.loadedDataSources.size, 0, 'no data sources are initially loaded');

    const metric1 = await this.service.findById('metric', 'revenue', 'bardTwo');
    assert.ok(
      metric1 instanceof MetricMetadataModel,
      '`findById` fetches an instance of `MetricMetadataModel` when requesting `metric` type'
    );
    assert.equal(metric1?.name, 'Revenue', '`fetchById fetches a metadata model given a type, id, & datasource');

    const metric2 = await this.service.findById('metric', 'revenue', 'bardTwo');
    assert.equal(metric1, metric2, '`findById` returns a local modal instance if already fetched');

    await this.service.loadMetadata({ dataSourceName: 'bardOne' });
    const dimension1 = await this.service.getById('dimension', 'currency', 'bardOne');
    assert.ok(dimension1 !== undefined && dimension1?.description === undefined, 'dimension is partially loaded');
    const dimension2 = await this.service.findById('dimension', 'currency', 'bardOne');
    assert.equal(dimension2?.partialData, false, '`findById` fully loaded a partially loaded model');
    assert.equal(
      dimension2?.description,
      'Reiciendis est blanditiis reiciendis nemo ut.',
      '`findById` fully loaded a partially loaded model'
    );
    assert.equal(
      dimension1,
      dimension2,
      'Object reference is stable when going from partially loaded to to fully loaded'
    );
  });
});

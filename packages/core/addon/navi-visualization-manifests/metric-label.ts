/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Metric Label Visualization
 * This file registers the visualization with navi
 *
 */
import NaviVisualizationBaseManifest from './base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export default class MetricLabelManifest extends NaviVisualizationBaseManifest {
  name = 'metric-label';
  niceName = 'Metric Label';
  icon = 'list-alt';

  typeIsValid(request: RequestFragment) {
    return this.hasNoGroupBy(request) && this.hasExplicitSingleTimeBucket(request) && this.hasSingleMetric(request);
  }
}

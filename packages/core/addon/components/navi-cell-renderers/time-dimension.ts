/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::TimeDimension
 *   @data={{this.row}}
 *   @column={{this.column}}
 *   @request={{this.request}}
 * />
 */

import Component from '@glimmer/component';
import { CellRendererArgs } from '../navi-table-cell-renderer';
import { canonicalizeMetric } from 'navi-data/utils/metric';

export default class TimeDimensionCellRenderer extends Component<CellRendererArgs> {
  /**
   * Date start time from the response data or 'TOTAL'
   */
  get value() {
    const {
      data,
      column: { field, parameters }
    } = this.args;
    const canonicalName = canonicalizeMetric({ metric: field, parameters });
    return data[canonicalName];
  }

  /**
   * Time Grain in request
   */
  get granularity() {
    const { column } = this.args;
    return column.parameters?.grain;
  }
}

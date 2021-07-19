import {
  DataSourceInstanceSettings,
  MetricFindValue,
  DataQueryRequest,
  DataQueryResponse,
  DataFrame,
  DataFrameView,
  ScopedVars,
} from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { GithubDataSourceOptions, Label, GitHubQuery, GitHubVariableQuery } from './types';
import { replaceVariables } from './variables';
import { isValid } from './validation';

export class DataSource extends DataSourceWithBackend<GitHubQuery, GithubDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<GithubDataSourceOptions>) {
    super(instanceSettings);
  }

  templateSrv = getTemplateSrv();
  annotations = {};

  // Only execute queries that have a query type
  filterQuery = (query: GitHubQuery) => {
    return isValid(query);
  };

  applyTemplateVariables(query: GitHubQuery, scoped: ScopedVars): Record<string, any> {
    return replaceVariables(this.templateSrv, query, scoped);
  }

  async getLabels(repository: string, owner: string, query?: string): Promise<Label[]> {
    return this.getResource('labels', {
      repository,
      owner,
      query,
    });
  }

  async getChoices(query: GitHubQuery): Promise<string[]> {
    const request = {
      targets: [
        {
          ...query,
          refId: 'metricFindQuery',
        },
      ],
      range: {
        to: {},
        from: {},
      },
    } as DataQueryRequest;

    try {
      const res = await this.query(request).toPromise();
      const columns = res.data[0]?.fields.map((f: any) => f.name) || [];
      return columns;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async metricFindQuery(query: GitHubVariableQuery, options: any): Promise<MetricFindValue[]> {
    const request = {
      targets: [
        {
          ...query,
          refId: 'metricFindQuery',
        },
      ],
      range: options.range,
      rangeRaw: options.rangeRaw,
    } as DataQueryRequest;

    let res: DataQueryResponse;

    try {
      res = await this.query(request).toPromise();
    } catch (err) {
      return Promise.reject(err);
    }

    if (!res || !res.data || res.data.length < 0) {
      return [];
    }

    const view = new DataFrameView(res.data[0] as DataFrame);
    return view.map((item) => {
      return {
        text: item[query.field || 'name'],
      };
    });
  }
}

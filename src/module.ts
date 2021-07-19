import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './DataSource';
import ConfigEditor from './views/ConfigEditor';
import QueryEditor from './views/QueryEditor';
import VariableQueryEditor from './views/VariableQueryEditor';
import { GitHubQuery, GithubDataSourceOptions, GithubSecureJsonData } from './types';

export const plugin = new DataSourcePlugin<DataSource, GitHubQuery, GithubDataSourceOptions, GithubSecureJsonData>(
  DataSource
)
  .setConfigEditor(ConfigEditor)
  .setVariableQueryEditor(VariableQueryEditor)
  .setQueryEditor(QueryEditor);

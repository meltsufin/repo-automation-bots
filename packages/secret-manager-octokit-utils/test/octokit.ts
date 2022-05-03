// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import nock from 'nock';
import snapshot from 'snap-shot-it';
import * as sinon from 'sinon';
import {describe, it, beforeEach, afterEach} from 'mocha';

import {Octokit} from '@octokit/rest';
import {getAuthenticatedOctokit} from '../src/secret-manager-octokit-utils';

describe('getAuthenticatedOctokit', () => {
  it('fetches bot credentials', async () => {
    const octokit = await getAuthenticatedOctokit('repo-automation-bots', 'cherry_pick_bot');
    const resp = await octokit.rest.rateLimit.get();
    console.log(resp);
  });

  it('throws an error when failing to fetch credentials', async () => {

  });

  it('throws an error when secret is malformed', async () => {

  });
});

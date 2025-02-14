// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {parser} from '../src/bin/mono-repo-publish';
import * as core from '../src/main';
import {describe, it, afterEach, beforeEach} from 'mocha';
import * as sinon from 'sinon';

const sandbox = sinon.createSandbox();

describe('CLI', () => {
  let getOctokitStub: sinon.SinonStub;
  let getFilesStub: sinon.SinonStub;
  let execSync: sinon.SinonStub;
  afterEach(() => {
    sandbox.restore();
  });
  beforeEach(() => {
    getOctokitStub = sandbox.stub(core, 'getOctokitInstance');
    getFilesStub = sandbox.stub(core, 'getsPRFiles');
    execSync = sandbox.stub(core.methodOverrides, 'execSyncOverride');
  });
  describe('default', () => {
    it('handles explicit credentials', async () => {
      getOctokitStub.resolves(sandbox.spy());
      getFilesStub.resolves(['packages/pkg1/package.json']);
      await parser.parseAsync(
        '--pr-url=https://github.com/testOwner/testRepo/pull/1234 --app-id-path=./test/fixtures/app-id --installation-id-path=./test/fixtures/installation-id --private-key-path=./test/fixtures/private-key'
      );

      sinon.assert.calledOnceWithExactly(
        getOctokitStub,
        './test/fixtures/app-id',
        './test/fixtures/private-key',
        './test/fixtures/installation-id'
      );
      sinon.assert.calledOnce(getFilesStub);
      sinon.assert.calledTwice(execSync);
      sinon.assert.calledWith(
        execSync.firstCall,
        'npm i --registry=https://registry.npmjs.org',
        sinon.match({cwd: 'packages/pkg1'})
      );
      sinon.assert.calledWith(
        execSync.secondCall,
        'npm publish --access=public',
        sinon.match({cwd: 'packages/pkg1'})
      );
    });
    it('handles credentials from the environment', async () => {
      getOctokitStub.resolves(sandbox.spy());
      getFilesStub.resolves(['packages/pkg1/package.json']);
      sandbox.stub(process, 'env').value({
        APP_ID_PATH: './test/fixtures/app-id',
        INSTALLATION_ID_PATH: './test/fixtures/installation-id',
        GITHUB_PRIVATE_KEY_PATH: './test/fixtures/private-key',
      });
      await parser.parseAsync(
        '--pr-url=https://github.com/testOwner/testRepo/pull/1234'
      );

      sinon.assert.calledOnceWithExactly(
        getOctokitStub,
        './test/fixtures/app-id',
        './test/fixtures/private-key',
        './test/fixtures/installation-id'
      );
      sinon.assert.calledOnce(getFilesStub);
      sinon.assert.calledWith(
        execSync.firstCall,
        'npm i --registry=https://registry.npmjs.org',
        sinon.match({cwd: 'packages/pkg1'})
      );
      sinon.assert.calledWith(
        execSync.secondCall,
        'npm publish --access=public',
        sinon.match({cwd: 'packages/pkg1'})
      );
    });
    it('uses executes a dry run', async () => {
      getOctokitStub.resolves(sandbox.spy());
      getFilesStub.resolves([
        'packages/pkg1/package.json',
        'packages/pkg1/package-lock.json',
      ]);
      sandbox.stub(process, 'env').value({
        APP_ID_PATH: './test/fixtures/app-id',
        INSTALLATION_ID_PATH: './test/fixtures/installation-id',
        GITHUB_PRIVATE_KEY_PATH: './test/fixtures/private-key',
      });
      await parser.parseAsync(
        '--pr-url=https://github.com/testOwner/testRepo/pull/1234 --dry-run'
      );

      sinon.assert.calledOnceWithExactly(
        getOctokitStub,
        './test/fixtures/app-id',
        './test/fixtures/private-key',
        './test/fixtures/installation-id'
      );
      sinon.assert.calledOnce(getFilesStub);
      sinon.assert.calledTwice(execSync);
      sinon.assert.calledWith(
        execSync.firstCall,
        'npm i --registry=https://registry.npmjs.org',
        sinon.match({cwd: 'packages/pkg1'})
      );
      sinon.assert.calledWith(
        execSync.secondCall,
        'npm publish --access=public --dry-run',
        sinon.match({cwd: 'packages/pkg1'})
      );
    });
  });

  describe('custom', () => {
    it('handles explicit credentials', async () => {
      getOctokitStub.resolves(sandbox.spy());
      getFilesStub.resolves(['packages/pkg1/package.json']);
      await parser.parseAsync(
        'custom --script=/path/to/script --pr-url=https://github.com/testOwner/testRepo/pull/1234 --app-id-path=./test/fixtures/app-id --installation-id-path=./test/fixtures/installation-id --private-key-path=./test/fixtures/private-key'
      );

      sinon.assert.calledOnceWithExactly(
        getOctokitStub,
        './test/fixtures/app-id',
        './test/fixtures/private-key',
        './test/fixtures/installation-id'
      );
      sinon.assert.calledOnce(getFilesStub);
      sinon.assert.calledOnceWithExactly(
        execSync,
        '/path/to/script',
        sinon.match({cwd: 'packages/pkg1'})
      );
    });
    it('handles credentials from the environment', async () => {
      getOctokitStub.resolves(sandbox.spy());
      getFilesStub.resolves(['packages/pkg1/package.json']);
      sandbox.stub(process, 'env').value({
        APP_ID_PATH: './test/fixtures/app-id',
        INSTALLATION_ID_PATH: './test/fixtures/installation-id',
        GITHUB_PRIVATE_KEY_PATH: './test/fixtures/private-key',
      });
      await parser.parseAsync(
        'custom --script=/path/to/script --pr-url=https://github.com/testOwner/testRepo/pull/1234'
      );

      sinon.assert.calledOnceWithExactly(
        getOctokitStub,
        './test/fixtures/app-id',
        './test/fixtures/private-key',
        './test/fixtures/installation-id'
      );
      sinon.assert.calledOnce(getFilesStub);
      sinon.assert.calledOnceWithExactly(
        execSync,
        '/path/to/script',
        sinon.match({cwd: 'packages/pkg1'})
      );
    });
  });
});

// Copyright 2021 Google LLC
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

import {v1 as SecretManagerV1} from '@google-cloud/secret-manager';
import {Octokit} from '@octokit/rest';

type OctokitType = typeof Octokit;

interface BotSecret {
  privateKey: string;
  appId: string;
  secret: string;
}

interface SecretManagerOptions {
  secretsClient?: SecretManagerV1.SecretManagerServiceClient;
  installationId?: number;
  octokitType?: OctokitType;
}

export async function getAuthenticatedOctokit(
  projectId: string,
  secretName: string,
  options?: SecretManagerOptions
): Promise<Octokit> {
  const secretsClient =
    options?.secretsClient || new SecretManagerV1.SecretManagerServiceClient();
  const secret = await getBotSecret(secretsClient, projectId, secretName);
  let auth = {
    appId: secret.appId,
    privateKey: secret.privateKey,
  };
  if (options?.installationId) {
    auth = {
      ...auth,
      ...{installationId: options.installationId},
    };
  }
  const OctokitConstructor = options?.octokitType || Octokit;
  return new OctokitConstructor({auth});
}

async function getBotSecret(
  secretsClient: SecretManagerV1.SecretManagerServiceClient,
  projectId: string,
  secretName: string
): Promise<BotSecret> {
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await secretsClient.accessSecretVersion({
    name,
  });
  // Extract the payload as a string.
  const payload = version?.payload?.data?.toString() || '';
  if (payload === '') {
    throw Error('did not retrieve a payload from SecretManager.');
  }
  return JSON.parse(payload);
}

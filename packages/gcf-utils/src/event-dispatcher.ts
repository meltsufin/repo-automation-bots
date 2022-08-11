// Copyright 2019 Google LLC
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
import {EmitterWebhookEventName as AllEventNames} from '@octokit/webhooks/dist-types/types';
import {WebhookEvent} from '@octokit/webhooks-types';
import {Webhooks, EmitterWebhookEvent} from '@octokit/webhooks';
import {Octokit} from '@octokit/rest';
import {GCFLogger, BotConfig} from './gcf-utils';

type CustomEventName =
  | 'schedule.repository'
  | 'schedule.installation'
  | 'schedule.global';
type EventName = AllEventNames | CustomEventName;

export type WebhookConfiguration = (app: EventDispatcher) => void;
interface Context<E extends EmitterWebhookEvent> {
  octokit: Octokit;
  payload: E;
}

export class EventDispatcher {
  private webhooks: Webhooks;
  private octokit: Octokit;
  constructor(botConfig: BotConfig) {
    this.webhooks = new Webhooks({
      secret: botConfig.webhookSecret,
      transform: this.payloadTransform.bind(this),
    });
    this.octokit = new botConfig.octokitType({
      auth: botConfig,
    });
  }

  on<E extends EmitterWebhookEvent>(
    event: E | E[],
    callback: (context: Context<EmitterWebhookEvent<E>>) => void
  ) {
    this.webhooks.on(event, callback);
  }

  async load(appConfig: WebhookConfiguration) {
    await appConfig(this);
  }

  private async payloadTransform<E extends EmitterWebhookEvent>(
    event: E
  ): Promise<Context<E>> {
    // FIXME
    const octokit = (await this.octokit.auth({
      type: 'event-octokit',
      event,
    })) as Octokit;
    return {
      octokit,
      payload: event,
    };
  }
}

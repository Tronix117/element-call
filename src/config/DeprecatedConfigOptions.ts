/*
Copyright 2022 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

@deprecated This all file is here until next major release
*/

import z from "zod";

/**
 * Deprecated config, all is optional
 * @deprecated
 */
export const deprecatedConfigSchema = z
  .object({
    /**
     * The Posthog endpoint to which analytics data will be sent.
     */
    posthog: z
      .object({
        api_key: z.string(),
        api_host: z.string(),
      })
      .optional(),

    /**
     * The Sentry endpoint to which crash data will be sent.
     */
    sentry: z
      .object({
        DSN: z.string(),
        environment: z.string(),
      })
      .optional(),

    /**
     * The rageshake server to which feedback and debug logs will be sent.
     */
    rageshake: z
      .object({
        submit_url: z.string(),
      })
      .optional(),

    /**
     * Features configuration, unset or false to disable
     */
    features: z
      .object({
        /** Allow to join a group calls without audio and video.
         * TEMPORARY: Is a feature that's not proved and experimental
         */
        feature_group_calls_without_video_and_audio: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
  .optional();

/**
 * This function and the preprocess should be remove on next major release
 * @deprecated
 */
export function handleDeprecatedConfig(
  maybeDeprecatedConfig: unknown
): unknown {
  const parsed = deprecatedConfigSchema.safeParse(maybeDeprecatedConfig);
  if (!parsed.success) return maybeDeprecatedConfig;

  const { data } = parsed;
  if (!data) return data;

  if (data.posthog || data.rageshake || data.sentry) {
    console.warn(
      "Deprecated config.json file used, `posthog`, `rageshake` and `sentry` config now goes to `features.analytics.{posthog|rageshake|sentry}`. It will not work anymore in the feature."
    );

    if (!data.features) data.features = {};
    const analytics = data.features["analytics"] ?? {};

    if (!analytics["posthog"] && data.posthog) {
      analytics["posthog"] = {
        project_api_key: data.posthog.api_key,
        api_host: data.posthog.api_host,
      };
    }
    if (!analytics["rageshake"] && data.posthog)
      analytics["rageshake"] = data.posthog;
    if (!analytics["sentry"] && data.posthog)
      analytics["sentry"] = data.posthog;

    data.features["analytics"] = analytics;
  }

  if (data.features?.feature_group_calls_without_video_and_audio) {
    console.warn(
      "Deprecated config.json file used, `features.feature_group_calls_without_video_and_audio` has been renamed to `features.group_calls_without_video_and_audio`. It will not work anymore in the feature."
    );

    data.features["group_calls_without_video_and_audio"] =
      data.features?.feature_group_calls_without_video_and_audio;
  }

  return data;
}

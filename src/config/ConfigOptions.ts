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
*/
import z from "zod";

/**
 * Old configuration compatibility
 * @deprecated should be removed on next major release
 */
import { handleDeprecatedConfig } from "./DeprecatedConfigOptions";

export const configSchema = z.preprocess(
  handleDeprecatedConfig,
  z.object({
    // Describes the default homeserver to use. The same format as Element Web
    // (without identity servers as we don't use them).
    default_server_config: z.object({
      ["m.homeserver"]: z
        .object({
          base_url: z.string(),
          server_name: z.string(),
        })
        .default({
          base_url: "http://localhost:8008",
          server_name: "localhost",
        }),
    }),

    /**
     * Features configuration, unset or false to disable
     */
    features: z
      .object({
        /** Allow to join a group calls without audio and video.
         * TEMPORARY: Is a feature that's not proved and experimental
         */
        group_calls_without_video_and_audio: z.boolean().default(false),

        /** Enable developer features */
        developer: z.boolean().default(false),

        analytics: z.preprocess(
          // Allow false as a conveniant way of disabling the feature
          (d) => (d === false ? null : d),
          z
            .null()
            .or(
              z.object({
                /**
                 * The Posthog endpoint to which analytics data will be sent.
                 */
                posthog: z
                  .object({
                    project_api_key: z.string(),
                    api_host: z.string(),
                  })
                  .passthrough()
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
              })
            )
            .default(null)
        ),
      })
      .default({}),
  })
);

export type ConfigOptions = z.infer<typeof configSchema>;

import { Prettify } from "./utils";

export type SettingKey = "seconds_per_round";

export type DBSetting = {
  readonly key: string;
  value: string;
};

export type Setting = Prettify<{
  key: SettingKey;
  /**
   * The value parsed from the DB string.
   * e.g. "6" (DB string) -> 6 (App number)
   */
  value: string | number | boolean;
}>;

/**
 * Helper type if you convert the array of settings into a single object
 * for easier access (e.g. settings.seconds_per_round)
 */
export type SettingsMap = Partial<Record<SettingKey, Setting["value"]>>;

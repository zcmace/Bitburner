/**
 * Information object holding the result of an attempted script execution.
 * @interface ScriptExecutionInfo
 * @property pid - The PID number executed. 0 represents the script was not executed.
 * @property host - The hostname where the script executed.
 * @property script - The script executed.
 * @property args - Optional. An array of arguments for the script.
 * @property threads - Number of threads to use. 0 represents the script was not executed.
 */
interface ScriptExecutionInfo {
  pid: number;
  host: string;
  script: string;
  args?: string[];
  threads: number;
}

export type { ScriptExecutionInfo };

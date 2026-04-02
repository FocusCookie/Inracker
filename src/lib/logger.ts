import { BaseDirectory, open } from "@tauri-apps/plugin-fs";

export interface StandardError {
  message: string;
  code?: string | number;
  stack?: string;
  timestamp: string;
  route?: string;
  variables?: any;
}

/**
 * Formats an unknown error into a StandardError object.
 */
export function formatError(error: any, context?: { route?: string; variables?: any }): StandardError {
  let message = "An unknown error occurred";
  let code: string | number | undefined;
  let stack: string | undefined;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
    code = (error as any).code;
  } else if (typeof error === "object" && error !== null) {
    message = error.message || error.error || JSON.stringify(error);
    code = error.code || error.status;
    stack = error.stack;
  }

  return {
    message,
    code,
    stack,
    timestamp: new Date().toISOString(),
    route: context?.route,
    variables: context?.variables,
  };
}

/**
 * Logs a StandardError to a local file in the AppData directory.
 */
export async function logError(error: StandardError) {
  try {
    const logEntry = JSON.stringify(error) + "\n";
    const file = await open("error.log", {
      write: true,
      append: true,
      create: true,
      baseDir: BaseDirectory.AppData,
    });
    
    await file.write(new TextEncoder().encode(logEntry));
    await file.close();
    
    // Also log to console for development
    console.error("Logged Error:", error);
  } catch (err) {
    console.error("Failed to write to error log file:", err);
  }
}

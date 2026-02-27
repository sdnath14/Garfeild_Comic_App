import Constants from "expo-constants";

const DEFAULT_BACKEND_PORT = 5050;

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

const getHostFromExpoConfig = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(":")[0];

  const manifestDebuggerHost = (Constants as any)?.manifest?.debuggerHost;
  if (manifestDebuggerHost) return manifestDebuggerHost.split(":")[0];

  const manifest2DebuggerHost =
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  if (manifest2DebuggerHost) return manifest2DebuggerHost.split(":")[0];

  return null;
};

export const getBackendUrl = () => {
  const configuredUrl = Constants.expoConfig?.extra?.BACKEND_URL;
  if (typeof configuredUrl === "string" && configuredUrl.trim().length > 0) {
    return stripTrailingSlash(configuredUrl.trim());
  }

  const host = getHostFromExpoConfig();
  if (host) {
    return `http://${host}:${DEFAULT_BACKEND_PORT}`;
  }

  return `http://localhost:${DEFAULT_BACKEND_PORT}`;
};

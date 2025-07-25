import { Configuration, LogLevel, RedirectRequest } from "@azure/msal-browser";

export const authConfig: Configuration = {
  auth: {
    clientId: "87f8596c-887d-4280-88f0-821ec093d0", // your Entra ID App Registration ID (clientId)
    authority: "https://login.microsoftonline.com/common", // set 'common' (for multi-tenant app) or your tenantId
    redirectUri: "/",
    postLogoutRedirectUri: "/",
  },
  system: {
    allowPlatformBroker: false, // Disables WAM Broker
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            // Suppress "already an instance" warning in development
            if (
              process.env.NODE_ENV === "development" &&
              message.includes(
                "There is already an instance of MSAL.js in the window with the same client id"
              )
            ) {
              return;
            }
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
  cache: {
    //cacheLocation: "sessionStorage", // This configures where your cache will be stored
    cacheLocation: "localStorage", // SSO between tabs
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ["User.Read"],
};

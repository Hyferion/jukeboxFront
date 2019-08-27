// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    REDIRECT_URI: 'http://127.0.0.1:4200',
    CLIENT_ID: '<YOUR_CLIENT_ID>',
    BACKEND_IP_BASE: 'http://127.0.0.1:8000',
    SPOTIFY_API_BASE: 'https://api.spotify.com/v1',
  }
;

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

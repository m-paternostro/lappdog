import { datadogRum } from '@datadog/browser-rum';

import { fetchEnvironmentVariables } from './common/util.js';

export default async () => {
  const variableMap = await fetchEnvironmentVariables(
    'LAPPDOG_DD_DISABLED',
    'DD_SITE',
    'DD_APP_ID',
    'DD_CLIENT_TOKEN',
    'DD_SERVICE',
    'DD_ENV',
    'DD_VERSION',
  );
  if (!variableMap) {
    throw new Error('Environment variables not found: not able to start Datadog RUM.');
  }

  if (variableMap.LAPPDOG_DD_DISABLED !== 'true') {
    const requiredValue = (name) => {
      const value = variableMap[name];
      if (!value) {
        throw new Error(`Unable to obtain the value for the '${name}' environment variable required for Datadog RUM.`);
      }
      return value;
    };

    datadogRum.init({
      applicationId: requiredValue('DD_APP_ID'),
      clientToken: requiredValue('DD_CLIENT_TOKEN'),
      site: requiredValue('DD_SITE'),
      service: requiredValue('DD_SERVICE'),
      env: requiredValue('DD_ENV'),
      version: requiredValue('DD_VERSION'),
      sampleRate: 100,
      trackInteractions: true,
      defaultPrivacyLevel: 'allow',
      allowedTracingOrigins: [
        /http.*/,
      ],
    });

    datadogRum.startSessionReplayRecording();
  }
};

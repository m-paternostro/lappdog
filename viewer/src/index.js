import { createElement, fetchEnvironmentVariables, performLongOperation } from './common/util.js';
import createContext from './models/context.js';
import createLappdogComponent from './components/lappdog.js';
import createMenubarComponent from './components/menubar.js';
import startDatadog from './datadog.js';

import '../resources/style.css';

const start = async () => {
  await performLongOperation(startDatadog);

  const body = document.body;
  const context = createContext();

  body.appendChild(createMenubarComponent(context));

  const main = createElement('div', 'lappdogs', { template: { className: 'lappdogs' } });
  context.listen((lappdog) => main.appendChild(createLappdogComponent(lappdog)));
  body.appendChild(main);

  const handleQueryParameters = async () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const uris = urlSearchParams.getAll('lappdog');
    const errors = await uris
      .reduce(
        async (promise, uri) => {
          const acc = await promise;
          try {
            await context.resolve(uri);
          } catch (error) {
            acc.push(error);
          }
          return acc;
        },
        Promise.resolve([]),
      );

    if (errors.length > 0) {
      const error = new Error('Unable to adopt one or more LappDogs.');
      console.log(error, errors);
      throw error;
    }
  };
  await performLongOperation(handleQueryParameters);

  const map = await fetchEnvironmentVariables('LAPPDOG_API_VERSION');
  console.log(`LappDog API Version: ${map?.LAPPDOG_API_VERSION ?? 'unknown'}`);
};
start();

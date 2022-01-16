/* eslint-disable max-len */

import { createElement, fetchEnvironmentVariables } from '../common/util.js';

export default (context) => {
  const menubar = createElement('div', 'menubar', { template: { className: 'menubar' } });

  const title = createElement('a', 'title', { parent: menubar, text: document.title, template: { className: 'title' } });

  const items = createElement('div', 'items', { parent: menubar });
  items.style.display = 'none';

  const adopt = createElement('a', 'adopt', { parent: items, text: 'Adopt' });
  const collapseAll = createElement('a', 'collapseAll', { parent: items, text: 'Collapse All Sections' });
  const expandAll = createElement('a', 'expandAll', { parent: items, text: 'Expand All Sections' });

  const hamburger = createElement('a', 'hamburger', { parent: menubar, text: '\u2630', template: { className: 'icon' } });

  items.onmouseleave = () => {
    if (items.style.display === 'block') {
      items.style.display = 'none';
    }
  };

  let exampleURL;
  adopt.onclick = async () => {
    if (!exampleURL) {
      exampleURL = (await fetchEnvironmentVariables('LAPPDOG_URL'))?.LAPPDOG_URL ?? 'http://localhost:1234';
    }
    const url = prompt("Enter the LappDog's URL:", exampleURL);
    if (url) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      urlSearchParams.append('lappdog', url);
      window.location.search = urlSearchParams.toString();
    }
  };

  // see lappdog.createLappdog
  const changeCollapsibleState = (collapse) => {
    const elements = document.getElementsByClassName('collapsible');
    if (elements.length > 0) {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.classList.contains('active') === collapse) {
          element.click();
        }
      }
    }
  };
  collapseAll.onclick = () => changeCollapsibleState(true);
  expandAll.onclick = () => changeCollapsibleState(false);

  const showMenu = () => {
    const display = items.style.display === 'block' ? 'none' : 'block';
    if (display === 'block') {
      if (context.empty()) {
        collapseAll.classList.add('disabled');
        expandAll.classList.add('disabled');
      } else {
        collapseAll.classList.remove('disabled');
        expandAll.classList.remove('disabled');
      }
    }
    items.style.display = display;
  };
  hamburger.onclick = showMenu;
  title.onclick = showMenu;

  return menubar;
};

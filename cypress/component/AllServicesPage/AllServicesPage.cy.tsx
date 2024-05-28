import React from 'react';
import AllServices from '../../../src/layouts/AllServices';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ScalprumProvider } from '@scalprum/react-core';
import { getVisibilityFunctions, initializeVisibilityFunctions } from '../../../src/utils/VisibilitySingleton';
import userFixture from '../../fixtures/testUser.json';
import { ChromeUser } from '@redhat-cloud-services/types';

describe('<AllServices />', () => {
  beforeEach(() => {
    // mock chrome and scalprum generic requests
    cy.intercept('http://localhost:8080/api/chrome-service/v1/static/stable/stage/services/services-generated.json', {
      status: 200,
      fixture: 'services.json',
    });
    cy.intercept('http://localhost:8080/entry?cacheBuster=*', '');
    cy.intercept('http://localhost:8080/foo/bar.json', {
      foo: {
        entry: ['/entry'],
      },
    });
    cy.intercept('http://localhost:8080/api/chrome-service/v1/static/stable/stage/navigation/settings-navigation.json?ts=*', {
      status: 200,
      fixture: 'settings-navigation.json',
    });
    cy.intercept('http://localhost:8080/api/chrome-service/v1/static/stable/stage/search/search-index.json', []);
  });

  it('should filter by service category title', () => {
    initializeVisibilityFunctions({
      getToken: () => Promise.resolve(''),
      getUser: () => Promise.resolve(userFixture as unknown as ChromeUser),
      getUserPermissions: () => Promise.resolve([]),
    });
    const visibilityFunctions = getVisibilityFunctions();
    const store = createStore(() => ({
      chrome: {
        moduleRoutes: [
          {
            path: '/test/link',
            scope: 'foo',
            module: 'bar',
          },
        ],
      },
    }));
    cy.mount(
      <ScalprumProvider
        config={{}}
        api={{
          chrome: {
            visibilityFunctions,
          },
        }}
      >
        <BrowserRouter>
          <Provider store={store}>
            <IntlProvider locale="en">
              <AllServices />
            </IntlProvider>
          </Provider>
        </BrowserRouter>
      </ScalprumProvider>
    );

    cy.get('.pf-v5-c-text-input-group__text-input').type('consoleset');
    cy.contains('Console Settings').should('exist');
  });
});

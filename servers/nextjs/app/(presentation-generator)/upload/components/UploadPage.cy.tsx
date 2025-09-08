import React from 'react'
import UploadPage from './UploadPage'
import { mount } from 'cypress/react'
import { store } from '@/store/store'
import { Provider } from 'react-redux'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Import global styles
import '@/app/globals.css'

// Create a mock router
const createRouter = (push = cy.stub().as('router.push')) => ({
  push,
  back: cy.stub(),
  forward: cy.stub(),
  refresh: cy.stub(),
  replace: cy.stub(),
  prefetch: cy.stub(),
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
})

interface RouterWrapperProps {
  children: React.ReactNode;
}

// Custom mount command with Redux Provider and Next.js Router
Cypress.Commands.add('mount', (component, options = {}) => {
  const router = createRouter()
  const RouterWrapper = ({ children }: RouterWrapperProps) => (
    <AppRouterContext.Provider value={router}>
      <Provider store={store}>
        {children}
      </Provider>
    </AppRouterContext.Provider>
  )

  return mount(
    <RouterWrapper>
      {component}
    </RouterWrapper>,
    options
  )
})

// Helper function to check for toast message
const checkToast = (message: string) => {
  // Wait for toast to appear and check its content
  cy.get('[role="status"]', { timeout: 5000 })
    .should('exist')
    .and('contain', message)
}

describe('<UploadPage />', () => {
  beforeEach(() => {
    // Set viewport size
    cy.viewport(1440, 900)

    // Reset any previous interceptions
    cy.intercept('POST', '**/ppt/generate*', {
      statusCode: 200,
      body: { id: 'test-id' }
    }).as('createPresentation')

    cy.intercept('POST', '**/ppt/titles/generate*', {
      statusCode: 200,
      body: { id: 'test-id', titles: ['Title 1', 'Title 2'] }
    }).as('generateTitles')

    cy.intercept('POST', '**/ppt/create', {
      statusCode: 200,
      body: { id: 'test-id' }
    }).as('getQuestions')

    cy.mount(<UploadPage />)
  })

  describe('Configuration Selection', () => {
    it('should allow selecting number of slides', () => {
      // Force click to handle any overlay issues
      cy.get('[data-testid="slides-select"]').click({ force: true })
      // Wait for content to be visible
      cy.get('[role="option"]').should('be.visible')
      // Click the option
      cy.get('[role="option"]').contains('12').click()
      // Verify selection
      cy.get('[data-testid="slides-select"]').should('contain', '12')
    })

    it('should allow selecting language', () => {
      // Force click to handle any overlay issues
      cy.get('[data-testid="language-select"]').click({ force: true })
      // Wait for content to be visible and click
      cy.get('[role="option"]').contains('Chinese').should('be.visible').click()
      // Verify selection
      cy.get('[data-testid="language-select"]').should('contain', 'Chinese')
    })
  })

  describe('Prompt Input', () => {
    it('should allow entering prompt text', () => {
      const testPrompt = 'Create a presentation about AI'
      cy.get('[data-testid="prompt-input"]').type(testPrompt)
      cy.get('[data-testid="prompt-input"]').should('have.value', testPrompt)
    })

    it('should toggle research mode', () => {
      cy.get('[data-testid="research-mode-switch"]').click()
      cy.get('[data-testid="research-mode-switch"]').should('have.attr', 'aria-checked', 'true')
    })
  })

  // File upload functionality has been removed

  describe('Validation', () => {
    it('should show error when no prompt is provided', () => {
      // Click next without entering prompt
      cy.contains('button', 'Next').click()
      // Check for error toast
      checkToast('Please provide a prompt for your presentation')
    })
  })

  describe('Generation Flow', () => {
    it('should proceed to outline page with prompt configuration', () => {
      // Enter prompt
      cy.get('[data-testid="prompt-input"]').type('Create a presentation about AI')

      // Intercept presentation creation API call
      cy.intercept('POST', '**/ppt/presentation/create', {
        statusCode: 200,
        body: { id: 'test-presentation-id' }
      }).as('createPresentation')

      // Click generate
      cy.contains('button', 'Next').click()

      // Wait for API call with longer timeout
      cy.wait('@createPresentation', { timeout: 10000 })

      // Verify navigation to outline page
      cy.get('@router.push').should('be.calledWith', '/outline')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Setup API to return error
      cy.intercept('POST', '**/ppt/create', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('apiError')

      // Enter prompt and try to generate
      cy.get('[data-testid="prompt-input"]').type('Test presentation')
      cy.contains('button', 'Next').click()

      // Check for error toast
      checkToast('Failed to generate presentation')
    })
  })
})

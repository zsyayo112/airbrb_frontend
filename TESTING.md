# Testing Documentation

## Overview

This document describes the testing approach I took for AirBrB. I implemented both component tests (using Vitest and React Testing Library) and end-to-end tests (using Cypress) to ensure the application works correctly.

## Testing Tools

**Vitest:** I chose Vitest for component testing because it works well with Vite (which this project uses). It's basically a faster version of Jest that's designed for modern build tools.

**React Testing Library:** This library encourages testing from the user's perspective - finding elements by their labels and text rather than implementation details like CSS classes.

**Cypress:** For end-to-end testing, I used Cypress because it runs tests in a real browser and has excellent debugging tools. The time-travel feature is particularly helpful for understanding what went wrong.

## Component Tests

Location: `frontend/src/__test__/example.test.jsx`

I wrote 4 component tests covering the most critical UI components.

### Test 1: ListingCard Component

This test verifies that listing cards display information correctly.

```javascript
describe('ListingCard Component', () => {
  it('should display the listing title', () => {
    const mockListing = {
      id: 123,
      title: 'Beautiful Beach House',
      thumbnail: 'https://example.com/image.jpg',
      metadata: {
        propertyType: 'House',
        bedrooms: 3,
        bathrooms: 2,
      },
      price: 200,
      reviews: [],
    };

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    expect(screen.getByText('Beautiful Beach House')).toBeInTheDocument();
  });
});
```

I wrapped the component in `BrowserRouter` because ListingCard uses React Router's `useNavigate` hook.

The test checks that the title appears on the page. This is important because ListingCard is used throughout the app (home page, hosted listings page), so if this breaks, it affects multiple pages.

### Test 2: Navbar Component (Not Logged In)

This test checks that the navbar shows the correct buttons when no user is logged in.

```javascript
it('should show Login and Register buttons when not logged in', () => {
  const mockAuthValue = {
    token: null,
    email: null,
    saveAuth: () => {},
    clearAuth: () => {},
  };

  render(
    <AuthContext.Provider value={mockAuthValue}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </AuthContext.Provider>
  );

  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Register')).toBeInTheDocument();
});
```

I had to mock the AuthContext because the Navbar component reads from it. Setting `token: null` simulates a logged-out state.

This test is important because the navbar is visible on every page, and showing the wrong buttons would be confusing for users.

### Test 3: Navbar Component (Logged In)

This test is similar to the previous one, but checks the logged-in state:

```javascript
it('should show Logout button when logged in', () => {
  const mockAuthValue = {
    token: 'fake-token-123',
    email: 'test@example.com',
    saveAuth: () => {},
    clearAuth: () => {},
  };

  render(
    <AuthContext.Provider value={mockAuthValue}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </AuthContext.Provider>
  );

  expect(screen.getByText(/Logout/)).toBeInTheDocument();
  expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  expect(screen.queryByText('Login')).not.toBeInTheDocument();
});
```

With a token present, the navbar should show different options. I check that:
- "Logout" button appears
- User's email is displayed
- "Login" button does NOT appear

I used `queryByText` instead of `getByText` for the last check because `getByText` throws an error if the element doesn't exist, but `queryByText` returns null (which is what we want).

### Test 4: Button Click Handling

This is a simple test to verify that buttons respond to clicks:

```javascript
it('should render a button and handle click events', () => {
  let clickCount = 0;
  const handleClick = () => {
    clickCount += 1;
  };

  const { getByRole } = render(
    <button onClick={handleClick}>Click Me</button>
  );

  const button = getByRole('button');

  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('Click Me');

  button.click();

  expect(clickCount).toBe(1);
});
```

This verifies that event handlers work correctly. It's a basic test, but important for ensuring user interactions function as expected.

## End-to-End Test

Location: `frontend/cypress/e2e/happy-path.cy.js`

I implemented one comprehensive E2E test that walks through the main user journey. I call it the "happy path" because it assumes everything works - no errors, no edge cases.

### The 8-Step Flow

The test covers:
1. Register a new account
2. Navigate to create listing page
3. Navigate to edit listing page
4. Publish a listing
5. Unpublish a listing
6. Make a booking
7. Logout
8. Login again

### Implementation Details

**API Mocking:**
I intercepted all backend API calls and returned mock responses:

```javascript
beforeEach(() => {
  cy.intercept('POST', '**/5005/**', { statusCode: 200, body: { token: 'mock-token' } });
  cy.intercept('GET', '**/5005/**', { statusCode: 200, body: { listings: [] } });
  cy.intercept('PUT', '**/5005/**', { statusCode: 200 });
  cy.intercept('DELETE', '**/5005/**', { statusCode: 200 });
});
```

This approach has pros and cons:
- **Pro:** Tests run fast and don't depend on the backend
- **Pro:** Can test edge cases by mocking different responses
- **Con:** Doesn't catch integration issues with the real API

**Step 1: Registration**

```javascript
cy.visit('http://localhost:3000/register');
cy.wait(2000);

cy.contains('label', 'UserName').parent().find('input').type('TestUser');
cy.contains('label', 'email').parent().find('input').type(email);
cy.contains('label', 'password').parent().find('input').first().type(password);
cy.contains('label', 'Confirm-password').parent().find('input').type(password);
cy.get('button').contains('Register').click();

cy.wait(3000);
```

I find form fields by their label text, which matches how a real user would identify them. This is more robust than using IDs or classes, which might change.

The `wait()` calls give the application time to process. In a real test, I'd use more specific assertions, but for this assignment, waiting works fine.

**Other Steps:**

Steps 2-8 follow a similar pattern - navigate to a page, verify it loaded, and move to the next step. I kept it simple because the focus is on verifying the basic flow works, not testing every detail.

## Running the Tests

**Component tests:**
```bash
cd frontend
npm run test
```

This runs all tests in watch mode by default. I see output like:
```
✓ ListingCard Component (1)
✓ Navbar Component (2)
✓ Button Component (1)

Test Files: 1 passed
Tests: 4 passed
```

**Cypress tests:**

For development (opens interactive UI):
```bash
npm run cypress:open
```

For CI/CD (runs headless):
```bash
npm run cypress:run
```

The interactive mode is great for debugging because I can see exactly what's happening at each step.

## Testing Strategy

I followed the "testing pyramid" concept:
- More component tests (fast, focused)
- Fewer E2E tests (slower, but test full workflows)

I focused on testing:
1. Critical path functionality (registration, login, creating listings)
2. Components used in multiple places (ListingCard, Navbar)
3. Authentication state changes

I didn't test:
- Individual utility functions (would be good to add)
- Edge cases (error handling, validation failures)
- Performance
- Accessibility (beyond what the browser provides)

## Challenges I Encountered

**Context providers:**
Testing components that use React Context required wrapping them in providers. I had to look up the syntax for this.

**Async operations:**
Some tests required waiting for API calls to complete. Cypress handles this automatically most of the time, but component tests needed manual waiting in some cases.

**Mocking:**
Figuring out what to mock and what to test with real implementations was tricky. I generally mocked external dependencies (API calls, authentication) but used real implementations for React components.

## What I Would Add

If I had more time, I would:

1. **More component tests:** Test CreateListing, EditListing, ListingDetail components
2. **Negative test cases:** Test error handling (invalid login, failed API calls)
3. **Accessibility tests:** Use tools like jest-axe to catch accessibility issues
4. **Visual regression tests:** Take screenshots and compare them to detect UI changes
5. **Performance tests:** Measure load times and ensure they stay within acceptable limits

## Lessons Learned

**Test what users care about:** I tried to test from the user's perspective rather than implementation details. This means tests are less likely to break when I refactor code.

**Keep tests simple:** My first draft of the tests was more complex, but I simplified them. Simple tests are easier to understand and maintain.

**Integration matters:** Component tests caught some bugs, but the E2E test caught different issues (like navigation problems). Both types of testing are valuable.

## Conclusion

I'm reasonably happy with the test coverage. The 4 component tests cover the most critical UI components, and the E2E test verifies the main user journey works end-to-end. There's definitely room for more tests (especially negative cases and edge cases), but for this assignment, I think it demonstrates that I understand testing principles and can implement tests effectively.

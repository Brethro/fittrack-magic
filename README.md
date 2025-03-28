
# Weara Body App

A personalized weight loss and body transformation application built with React, TypeScript, and Supabase.

## Development Notes

### Known Issues

- **404 Resource Errors**: You may see 404 errors in the console for resources like CSS or JS files. These are normal in development mode and won't affect the functionality of the app.

- **Service Worker Errors**: Errors related to ServiceWorker or Cache API might appear in some browsers. These are handled gracefully and won't impact the application.

- **Third-party Script Errors**: The application includes error boundary handling for third-party scripts to ensure they don't break the main application functionality.

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Environment Variables

The application uses Supabase for backend functionality. You can either:
- Set up environment variables in a .env file
- Use the admin interface to configure Supabase credentials
- Let the application use the default demo credentials


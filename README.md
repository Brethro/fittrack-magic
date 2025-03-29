
# Weara Body App

A personalized weight loss and body transformation application built with React, TypeScript, and Supabase.

## Development Notes

### Known Issues

- **404 Resource Errors**: You may see 404 errors in the console for resources like CSS or JS files. These are normal in development mode and won't affect the functionality of the app.

- **Service Worker Errors**: Errors related to ServiceWorker or Cache API might appear in some browsers. These are handled gracefully and won't impact the application.

- **Third-party Script Errors**: The application includes error boundary handling for third-party scripts to ensure they don't break the main application functionality.

### Authentication Flow

The application uses Supabase authentication, which works as follows:

1. User signs up or signs in through the application interface
2. For sign-ups, a confirmation email is sent to the user's email address
3. The confirmation link redirects back to the application's callback URL
4. The application processes the authentication token and logs the user in

### Supabase Configuration

**Important**: For authentication to work correctly, you need to configure the following in your Supabase project dashboard:

1. Go to Authentication > URL Configuration
2. Set the Site URL to your production URL (e.g., https://wearabody.dev)
3. Add all allowed redirect URLs:
   - https://wearabody.dev/auth/callback
   - http://localhost:3000/auth/callback (for local development)
   - Any other domains where you host the app

Without these settings, authentication redirects will not work correctly, and you'll see localhost URLs in your verification emails.

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Environment Variables

The application uses Supabase for backend functionality. You can either:
- Set up environment variables in a .env file
- Use the admin interface to configure Supabase credentials
- Let the application use the default demo credentials

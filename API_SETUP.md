# API Key Setup Guide

## Getting a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account if not already signed in
3. Click on "Create API Key" or "Get API Key"
4. Copy the generated API key

## Adding the API Key to the Project

1. Open the `.env.local` file in the root directory of the project
2. Replace `your_api_key_here` with the API key you copied:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Save the `.env.local` file
4. Restart the development server (`npm run dev`)

## Troubleshooting

If you get errors about the API key:

- Make sure the key does NOT start with "AI" (the new format doesn't start with "AI")
- Ensure you've copied the entire key (it should be a long string)
- Check that there are no spaces or quotes around the key
- Verify the `.env.local` file is in the root directory of the project

## Model Information

This project uses the `gemini-2.0-flash-001` model from Google AI Studio. The API key is used to access this model for generating content. 
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c4dff331-84a2-4bc6-b9d9-148ac6f7890b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c4dff331-84a2-4bc6-b9d9-148ac6f7890b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c4dff331-84a2-4bc6-b9d9-148ac6f7890b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Where is NOAA tide data stored?

The mobile APK functions primarily as a frontend. It fetches live NOAA data at
runtime **directly from** `https://api.tidesandcurrents.noaa.gov` without any
intermediate servers. The results are cached locally using SQLite (or
`localStorage`/`SharedPreferences` on platforms that do not support SQLite).
This allows the last retrieved tide information to remain available when
offline.

## How do I build the Android debug APK?

Follow these steps to produce a debug build of the Android application:

1. Install dependencies:
   ```sh
   npm install
   ```
2. Generate the web assets:
   ```sh
   npm run build
   ```
3. Build the APK:
    ```sh
    cd android && ./gradlew assembleDebug
    ```

The generated APK can be found at
`android/app/build/outputs/apk/debug/app-debug.apk`.

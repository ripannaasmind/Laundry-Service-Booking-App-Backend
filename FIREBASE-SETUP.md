# Firebase Admin SDK Setup

## How to Get Your Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **flutter-22f32**
3. Click the gear icon ⚙️ next to "Project Overview" and select **Project Settings**
4. Navigate to the **Service Accounts** tab
5. Click **Generate New Private Key** button
6. A JSON file will be downloaded

## Update Your .env File

Open the downloaded JSON file and extract these three values:

- `project_id` → Copy to `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → Copy to `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → Copy to `FIREBASE_ADMIN_PRIVATE_KEY`

**Example .env entries:**
```env
FIREBASE_ADMIN_PROJECT_ID=flutter-22f32
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-rewfn@flutter-22f32.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAo...\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the private key wrapped in double quotes
- Keep the `\n` characters in the private key string
- Never commit the actual private key to git (it's already in .gitignore)

## Alternative: Use the JSON File Directly (Not Recommended)

If you prefer to use the JSON file:
1. Place the downloaded JSON file in `src/config/`
2. Rename it to: `flutter-22f32-firebase-adminsdk-rewfn-c03bd586b2.json`
3. The file is already in .gitignore so it won't be committed

However, using environment variables (as configured now) is more secure and flexible.

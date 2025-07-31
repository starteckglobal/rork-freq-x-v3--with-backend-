# Firebase Setup Instructions

## Firebase Storage Security Rules

To enable music uploads, you need to configure Firebase Storage security rules in the Firebase Console:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `freq-8a96f`
3. Navigate to Storage > Rules
4. Replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Firebase Authentication

The app uses anonymous authentication to allow users to upload files without requiring account creation:

1. Go to Authentication > Sign-in method
2. Enable "Anonymous" authentication
3. Save the changes

## Storage Structure

Uploaded files will be organized as:
```
music/
  {userId}/
    {filename}_{timestamp}.{extension}
covers/
  {userId}/
    {timestamp}.jpg
```

## Error Troubleshooting

### "User does not have permission to access" Error
- Ensure Storage rules allow authenticated users (including anonymous)
- Verify Anonymous authentication is enabled
- Check that the app successfully signs in anonymously

### "Upload completed but no URL received" Error
- This usually indicates a network issue or Firebase configuration problem
- Check Firebase project configuration
- Verify storage bucket exists and is accessible

## Testing

After configuring the rules:
1. Restart the app
2. Try uploading a music file
3. Check the Firebase Console > Storage to see uploaded files
4. Verify files are accessible via the generated URLs
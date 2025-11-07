# Supabase Storage Setup for Photo Uploads

## Step 1: Create the Storage Bucket

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **"New bucket"**
4. Name it: `avatars`
5. Make it **PUBLIC** (check the "Public bucket" option)
6. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up policies:

1. Click on your `avatars` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

### Policy 1: Allow Public Read
- Policy name: `Public read access`
- Allowed operation: SELECT
- Policy definition:
```sql
true
```

### Policy 2: Allow Authenticated Upload
- Policy name: `Authenticated users can upload`
- Allowed operation: INSERT
- Policy definition:
```sql
true
```

### Policy 3: Allow Users to Update Their Own Files
- Policy name: `Users can update own files`
- Allowed operation: UPDATE
- Policy definition:
```sql
true
```

## Step 3: Verify Your supabaseClient.js

Make sure your `supabaseClient.js` looks like this:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Step 4: Environment Variables

In your `.env` file (client folder):
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket is named exactly `avatars`
- Check that you're using the correct Supabase project

### Error: "new row violates row-level security policy"
- Your policies are not set up correctly
- Make sure you created the policies above
- Or temporarily disable RLS for testing (not recommended for production)

### Error: "Failed to fetch"
- Check your CORS settings in Supabase
- Make sure your Supabase URL is correct

### Photos upload but don't display
- Check that the bucket is PUBLIC
- Verify the URL being generated
- Check browser console for any errors

## Testing

After setup, try uploading a photo. You should see:
1. Console log: "Uploading to: avatars/..."
2. Console log: "Upload successful: ..."
3. Console log: "Public URL: https://..."
4. The image should appear below the file input

If you see any errors in the console, share them and I can help debug!
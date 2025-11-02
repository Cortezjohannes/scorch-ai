# 🧪 Testing Story Bible Sharing - Quick Guide

## Prerequisites
- ✅ Firebase configured and deployed
- ✅ Dev server running (`npm run dev`)
- ✅ User account created (for creating shares)
- ✅ Story bible generated

---

## Test 1: Create a Share Link (5 min)

### Steps:
1. Go to `http://localhost:3000/story-bible`
2. Wait for story bible to load
3. Look for **blue "Share" button** with 🔗 icon (next to Regenerate button)
4. Click "Share"

### Expected Result:
- Modal opens with two tabs: "Create Link" and "Manage Links"
- "Create Link" tab is active by default
- Shows expiration date picker (optional)
- Has "Generate Share Link" button

### Create a Link:
1. Leave expiration blank (or set a future date)
2. Click "Generate Share Link"
3. Wait for success message
4. Link appears with copy button

### Expected:
- ✅ checkmark and "Link Created!" message
- Full URL displayed (e.g., `http://localhost:3000/shared/abc-123-def`)
- "Copy" button present
- Can click to create another link

---

## Test 2: Access Shared Link (5 min)

### Steps:
1. Copy the generated link
2. Open **incognito/private browser** (to test without auth)
3. Paste link and navigate to it

### Expected Result:
- Page loads showing story bible
- Top banner shows "Shared by [Your Name]"
- Connection status: green dot + "Connected"
- Story bible content is fully visible
- Can scroll through all tabs

### Important:
- ❌ Should NOT require login
- ✅ Should show full content
- ✅ Should show version number (v1, v2, etc.)
- ✅ Bottom right: "Real-time Collaboration" notice

---

## Test 3: Real-time Editing (10 min)

### Setup:
- Browser 1: Regular browser (authenticated)
- Browser 2: Incognito (on same shared link)

### Steps:

#### In Browser 1:
1. Navigate to story bible
2. Make an edit (change series title, character name, etc.)
3. Watch for "Saving..." indicator (top right)
4. Should disappear after ~500ms

#### In Browser 2:
1. Watch the same field you edited
2. After ~1-2 seconds, should see the change appear
3. Version number should increment (e.g., v1 → v2)

#### In Browser 2:
1. Now make YOUR OWN edit
2. Watch version increment

#### In Browser 1:
1. Should see Browser 2's edit appear
2. Version increments again

### Expected:
- ✅ Changes sync bidirectionally
- ✅ No page refresh needed
- ✅ Version numbers increment
- ✅ "Last updated" timestamp changes
- ✅ Both browsers always show latest content

---

## Test 4: Access Logging (5 min)

### Steps:
1. Go back to story bible page (authenticated browser)
2. Click "Share" button
3. Click "Manage Links" tab

### Expected Result:
- Shows list of your share links
- Each link shows:
  - Status badge (green "Active")
  - Creation date
  - Full URL
  - Stats: 👁️ X views, ✏️ Y edits
  - Expiration date (if set)
  - Action buttons: Copy, Extend, Revoke

### Verify Stats:
- Views should match how many times you opened the link
- Edits should match how many times you made changes

---

## Test 5: Revoke Link (3 min)

### Steps:
1. In "Manage Links" tab
2. Find an active link
3. Click "Revoke" button
4. Confirm the action
5. Copy the revoked link URL
6. Open in new incognito window

### Expected Result:
- Link status changes to red "Revoked"
- When accessing revoked link:
  - ❌ Shows error page
  - "Link Revoked" heading
  - Error message explaining link was revoked
  - "Go Home" button

---

## Test 6: Expiration (5 min)

### Create Expired Link:
1. Create new share link
2. Set expiration date to **1 minute in the future**
3. Copy link
4. Wait 61+ seconds
5. Access link in incognito

### Expected Result:
- ❌ Shows error page
- "Link Expired" heading
- Error message explaining expiration
- "Go Home" button

### Create Expiring-Soon Link:
1. Create link with expiration in ~24 hours
2. Access immediately

### Expected:
- ⚠️ Yellow warning banner at top
- "This link will expire on [date] at [time]"

---

## Test 7: Invalid Links (2 min)

### Steps:
1. Navigate to `http://localhost:3000/shared/invalid-123`
2. Or any random string

### Expected:
- ❌ Shows error page
- "Not Found" heading
- Error message
- "Go Home" button

---

## Test 8: Extend Expiration (3 min)

### Steps:
1. Create link with expiration date
2. Go to "Manage Links"
3. Click "Extend" button on that link
4. Enter new date in prompt (format: YYYY-MM-DD)
5. Click OK

### Expected:
- Link updates with new expiration date
- Status remains "Active"
- New expiration shown in list

---

## Test 9: Multiple Simultaneous Editors (Advanced)

### Setup:
- 3 browsers/devices with same shared link

### Steps:
1. Browser A: Edit series title
2. Browser B: Edit character name
3. Browser C: Edit narrative arc

### Expected:
- All changes appear in all browsers
- Version increments for each edit
- No conflicts or lost data
- Smooth, no lag

---

## Common Issues & Solutions

### Issue: "Permission Denied" error
**Solution:** Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### Issue: Share button is disabled
**Solution:** 
- Make sure you're logged in
- Make sure story bible is loaded

### Issue: Changes don't sync
**Solution:**
- Check connection status (green dot)
- Check browser console for errors
- Verify Firestore rules are deployed

### Issue: Link shows 404
**Solution:**
- Verify link ID is correct
- Check if link was revoked
- Check Firebase Console → Firestore → shareLinks collection

---

## Success Criteria

### ✅ All tests should pass:
- [x] Can create share links
- [x] Can access without authentication
- [x] Real-time sync works bidirectionally
- [x] Access logs track views and edits
- [x] Can revoke links
- [x] Revoked links are inaccessible
- [x] Expiration works
- [x] Can extend expiration
- [x] Invalid links show error
- [x] Multiple users can edit simultaneously

---

## Performance Benchmarks

### Expected Performance:
- **Link creation:** < 2 seconds
- **Page load:** < 3 seconds
- **Edit sync:** < 2 seconds
- **Auto-save delay:** 500ms
- **Revoke effect:** Immediate

---

## Firebase Console Verification

### Check Data in Firestore:
1. Go to [Firebase Console](https://console.firebase.google.com/project/greenlitai/firestore)
2. Look for collections:
   - `shareLinks` - Should have your created links
   - `sharedStoryBibles` - Should have the shared data
3. Verify data structure matches documentation

### Check Rules:
1. Go to Firebase Console → Firestore → Rules
2. Verify rules match `firestore.rules` file
3. Check last deploy timestamp

---

## Troubleshooting Commands

```bash
# Restart dev server
npm run dev

# Redeploy Firestore rules
firebase deploy --only firestore:rules

# Check Firebase login
firebase login:list

# Test Firebase connection
node scripts/test-firebase-connection.js

# Check for linting errors
npm run lint
```

---

## Report Issues

If you find bugs:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check server logs
4. Screenshot the issue
5. Document in GitHub issues or Notion

---

**Happy Testing! 🎉**








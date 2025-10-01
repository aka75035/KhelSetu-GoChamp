# 🚨 WHITE SCREEN DEBUGGING STEPS

## 🔍 Step 1: Use Chrome DevTools (MOST IMPORTANT)

1. **Connect your phone to computer via USB**
2. **Enable USB debugging** on your phone
3. **Open Chrome browser** on your computer
4. **Go to:** `chrome://inspect`
5. **Find your app** in the device list
6. **Click "Inspect"** next to your app
7. **Check the Console tab** for errors

### What to look for in Console:
- ✅ `🚀 Khelsetu App Starting...`
- ✅ `📱 Initializing Capacitor...`
- ✅ `🌟 Mounting React app...`
- ✅ `✅ React app mounted successfully!`

### Common error messages:
- ❌ `Failed to load module`
- ❌ `SyntaxError`
- ❌ `Network error`
- ❌ `Cannot read property`

## 🧪 Step 2: Test the Debug Page

1. **In Chrome DevTools Console**, type:
   ```javascript
   window.location.href = './debug.html'
   ```
2. **Press Enter**
3. **If you see the debug page**, it means:
   - ✅ WebView is working
   - ✅ File loading works
   - ✅ JavaScript execution works

## 🔧 Step 3: Common White Screen Fixes

### Fix 1: Clear App Data
1. Phone Settings → Apps → Khelsetu
2. Storage → Clear Data
3. Force Stop the app
4. Restart the app

### Fix 2: Update WebView
1. Google Play Store
2. Search "Android System WebView"
3. Update if available
4. Restart your phone

### Fix 3: Check Permissions
1. Phone Settings → Apps → Khelsetu → Permissions
2. Enable Camera, Storage, Microphone
3. Restart the app

### Fix 4: Try Different APK Install Method
1. In Android Studio → Build → Build Bundle(s)/APK(s) → Build APK(s)
2. Copy APK to phone manually
3. Install via file manager

## 📱 Step 4: Device-Specific Checks

### Check Android Version:
- Android 7.0+ required for modern WebView
- Android 8.0+ recommended

### Check Available Storage:
- Need at least 100MB free space
- Clear cache if needed

### Check RAM:
- Close other apps
- Restart phone if low on memory

## 🆘 Step 5: Alternative Testing

### Test on Emulator:
1. Android Studio → AVD Manager
2. Create/Start an emulator
3. Run app on emulator instead

### Test Simplified Version:
1. In Chrome DevTools Console:
   ```javascript
   document.body.innerHTML = '<h1 style="color:red;padding:20px;">TEST - If you see this, WebView works!</h1>';
   ```

## 📋 Step 6: Report Back

**Tell me what you see in Chrome DevTools Console:**
- Are there any red error messages?
- Do you see the 🚀 emoji messages?
- Does the debug.html page load?

**Device Info:**
- What Android version?
- What phone model?
- How much free storage?

## 🎯 Quick Test Commands

**In Chrome DevTools Console, try these one by one:**

```javascript
// 1. Check if basic HTML loaded
console.log('HTML loaded:', !!document.getElementById('root'));

// 2. Check if assets are accessible
fetch('./assets/index-a6EHL-ax.js').then(r => console.log('JS accessible:', r.ok));

// 3. Check Capacitor
console.log('Capacitor available:', !!window.Capacitor);

// 4. Force load debug page
window.location.href = './debug.html';
```

---

**📞 NEXT: Tell me what errors you see in Chrome inspect console!**
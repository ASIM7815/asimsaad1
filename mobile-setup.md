# Mobile Android Setup Guide

## Your Website Already Works on Android!

The current HTML5 website is fully compatible with Android phones. Just open it in Chrome/Firefox.

## How to Use on Android

### Option 1: Direct Browser Access
1. Open Chrome on Android
2. Go to `https://your-domain.com`
3. Allow camera/microphone permissions
4. Use QR scanner or generate QR code

### Option 2: Install as PWA (Progressive Web App)
1. Open website in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home Screen"
4. App icon appears on home screen

## Mobile Optimizations Added

✅ Responsive design for small screens
✅ Touch-friendly buttons
✅ Lower video quality (640x480) for mobile data
✅ Front camera default on mobile
✅ Prevents zoom/pinch gestures
✅ Full-screen capable

## Native Android App (Optional)

If you want a native Android app, use WebView wrapper:

### Create Android App with WebView

**MainActivity.java:**
```java
package com.yourapp.videocall;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        WebView webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.grant(request.getResources());
            }
        });
        
        webView.loadUrl("https://your-domain.com");
    }
}
```

**AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

## Testing on Android

1. **Local Network Testing:**
   - Find your PC IP: `ipconfig` (Windows) or `ifconfig` (Linux)
   - Access from phone: `https://192.168.x.x:3000`

2. **HTTPS Required:**
   - Camera/mic only work with HTTPS (or localhost)
   - Use ngrok for testing: `ngrok http 3000`

## Browser Compatibility

✅ Chrome (Recommended)
✅ Firefox
✅ Edge
✅ Samsung Internet
❌ Opera Mini (limited WebRTC)

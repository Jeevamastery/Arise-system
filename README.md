# Solo Leveling: Real-Life Hunter System OS (Cloud APK Builder)

This project is pre-configured with **CapacitorJS + GitHub Actions** so that GitHub's cloud servers compile your standalone `.apk` automatically—no local Android Studio or Java installation needed.

## Quick Steps to Build Your `.apk` on GitHub
1. **Replace `src/App.jsx`**: Copy the full `App.jsx` code from the Gemini Canvas editor and paste it into `src/App.jsx`.
2. **Push/Upload to GitHub**:
   - Create a new repository on GitHub.
   - Upload all files from this folder (make sure to include the `.github/workflows/build-apk.yml` file).
3. **Download Your `.apk`**:
   - Click the **Actions** tab in your GitHub repository.
   - Click on the **Build Solo Leveling System APK** workflow run.
   - Wait ~2–3 minutes for it to turn green, then scroll down to **Artifacts** and download **`Solo-Leveling-System-APK`**.
   - Unzip it to get `app-debug.apk` and install it directly on your Android phone!

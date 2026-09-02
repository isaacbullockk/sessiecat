# Sessiecat Mobile Setup & Build Guide

This project is a hybrid web and mobile application built with **React**, **Vite**, **Tailwind CSS**, and **CapacitorJS**. 

If you are opening this project on your local machine and want to run it in **Android Studio**, follow the quick setup steps below to resolve and prevent Gradle configuration errors.

---

## 🛠️ Local Machine Setup Steps

Because the downloaded source code does not include the heavy `node_modules` directory (where Capacitor libraries live), you must install dependencies and synchronize the native Android configurations before sync-building in Android Studio.

### Step 1: Install Dependencies
Open your command prompt or terminal in the root folder of this project (where `package.json` is located) and run:
```bash
npm install
```
*This command downloads all necessary packages, including `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android`, creating the local `node_modules` directory.*

### Step 2: Build the Web Project
Generate the production-ready static web assets:
```bash
npm run build
```
*This compiles your React application and outputs the files into the `dist/` folder.*

### Step 3: Synchronize Capacitor with Android
Sync your compiled web assets and plugins to the native Android platform project:
```bash
npx cap sync android
```
*This command updates all native Android configurations and ensures that Gradle can find the capacitor-android dependency project inside your `node_modules` folder.*

---

## 📱 Running in Android Studio

Once the above commands are successfully completed:

1. Open **Android Studio**.
2. Click **Open An Existing Project** and select the `/android` directory of this unzipped folder.
3. Android Studio will automatically start syncing the Gradle files. 
   - *Since `gradle-9.4.1` and `com.android.tools.build:gradle:9.2.0` have been set inside `/android/gradle/wrapper/gradle-wrapper.properties` and `/android/build.gradle`, everything will load seamlessly and build using the latest version!*

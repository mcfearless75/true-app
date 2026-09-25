// Builds the signed Android App Bundle (.aab) that gets uploaded to Google
// Play:  npm run release:android
//
// Needs android/keystore.properties (see the .example next to it). Bump
// versionCode in android/app/build.gradle before each Play upload — Play
// rejects a bundle whose versionCode it has already seen.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

if (!existsSync('android/keystore.properties')) {
  console.error('No android/keystore.properties — copy android/keystore.properties.example and fill it in.');
  process.exit(1);
}

// Java: whatever's on the machine, else the one Android Studio bundles
const env = { ...process.env };
const studioJbr = 'C:/Program Files/Android/Android Studio/jbr';
if (!env.JAVA_HOME && existsSync(studioJbr)) env.JAVA_HOME = studioJbr;
if (!env.ANDROID_HOME && env.LOCALAPPDATA) env.ANDROID_HOME = join(env.LOCALAPPDATA, 'Android', 'Sdk');

const run = (cmd, cwd = '.') => execSync(cmd, { stdio: 'inherit', env, cwd });

run('npm run build:app');
run('npx cap sync android');
// Full path: Windows shells may be set not to look in the current folder
const gradlew = join(process.cwd(), 'android', process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
run(`"${gradlew}" bundleRelease`, 'android');

const out = 'android/app/build/outputs/bundle/release/app-release.aab';
console.log(existsSync(out) ? `\nSigned bundle ready: ${out}` : '\nBuild finished but no bundle found — check the output above.');

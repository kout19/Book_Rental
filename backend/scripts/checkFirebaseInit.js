import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svcPath = path.join(__dirname, '../config/serviceAccountKey.json');

try {
  if (!fs.existsSync(svcPath)) {
    console.error('serviceAccountKey.json not found at', svcPath);
    process.exit(2);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(svcPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('firebase-admin initialized successfully. admin.apps.length =', admin.apps.length);
  process.exit(0);
} catch (e) {
  console.error('firebase-admin initialization failed:', e && (e.message || e));
  process.exit(1);
}

import webpush from 'web-push';
import fs from 'fs';
const vapidKeys = webpush.generateVAPIDKeys();
const keys = {
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey
};
fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2));

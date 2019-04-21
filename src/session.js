/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/lib/get-session-id.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

function saveSessionId(stored) {
    try {
        sessionStorage.setItem('session_id', JSON.stringify(stored));
    }
    catch (e) {
        console.error(e);
    }
}
 
export function generateSessionId() {
    const hash = require('hash.js');
    const sha2 = hash.sha256();
    const id = sha2.update((('' + Math.random() * 10000) + Date.now()) + Math.random() * 1000).digest('hex');
    const ttl = fiveMinutesFromNow();
    const stored = {id, ttl};
    
    saveSessionId(stored);
   
    return stored;
}

export function getSessionId() {
    let stored = sessionStorage.getItem('session_id') || null;
    let id, ttl;

    if (stored !== null) {
        id = stored.id;
        ttl = stored.ttl;
    }
    else {
        id = '';
        ttl = 0;
    }

    if (ttl < Date.now()) {
        stored = generateSessionId();
        id = stored.id;
        ttl = stored.ttl;
    }
    else {
        ttl = fiveMinutesFromNow();
        stored = {id: id, ttl: ttl};
        saveSessionId(stored);
    }

    return id;
}

function fiveMinutesFromNow() {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d;
}

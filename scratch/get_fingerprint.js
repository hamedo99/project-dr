
const { machineIdSync } = require('node-machine-id');
const si = require('systeminformation');
const crypto = require('crypto');

const SALT = "DR_HAHIDER_SECURE_SALT_2024";

async function getFingerprint() {
    try {
        const mid = machineIdSync();
        const baseboard = await si.baseboard();
        const system = await si.uuid();

        const rawString = `${mid}-${baseboard.serial}-${system.os}`;

        return crypto
            .createHmac('sha256', SALT)
            .update(rawString)
            .digest('hex');
    } catch (error) {
        console.error("❌ Error getting fingerprint:", error);
        return "UNKNOWN_DEVICE";
    }
}

getFingerprint().then(fp => {
    console.log("FINGERPRINT:" + fp);
});

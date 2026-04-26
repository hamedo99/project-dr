
const { getFingerprint } = require('./src/lib/licensing');

async function main() {
    try {
        const fp = await getFingerprint();
        console.log("DEVICE_FINGERPRINT_START");
        console.log(fp);
        console.log("DEVICE_FINGERPRINT_END");
    } catch (e) {
        console.error(e);
    }
}

main();

const core = require("@actions/core");
const openpgp = require("openpgp");
const fs = require("fs");
async function run() {
    try {
        console.log("started");
        const inputText = core.getInput("text", { required: true });
        console.log(`input value: ${inputText}`);
        try {
            if (fs.existsSync(path)) {
                var text = fs.readFileSync(inputText);
            }
        } catch (err) {
            var text = inputText;
        }
        console.log(`text inputted: ${text}`);
        const useKeyserver =
            core.getInput("keysource", { required: true }) === "keyserver"
                ? true
                : false;
        console.log(`keysource: ${keysource}`);
        const inputKey = core.getInput("key", { required: true });
        const isPrivate = !!key.includes("PRIVATE KEY BLOCK");
        console.log(`key inputted: ${key}`);
        if (isPrivate) {
            const passphrase = core.getInput("passphrase");
            console.log("inputted key is private and will be used for signing");
        } else {
            const privateInputKey = core.getInput("privateKey");
        }
        const keyserver = core.getInput("keyserver", { required: false });
        console.log(`keyserver inputted: ${keyserver}`);
        if (useKeyserver) {
            var hkp = !!keyserver
                ? new openpgp.HKP(keyserver)
                : new openpgp.HKP();
            const key = await hkp.lookup({
                query: inputKey
            });
        } else {
            const key = inputKey;
        }
        if (isPrivate) {
            var {
                keys: [privateKey]
            } = await openpgp.key.readArmored(key);
            if (!!passphrase) {
                await privateKey.decrypt(passphrase);
            }
            const { data: result } = await openpgp.sign({
                message: openpgp.cleartext.fromText(text),
                privateKeys: [privateKey]
            });
        } else {
            try {
                const {
                    keys: [privateKey]
                } = await openpgp.key.readArmored(privateInputKey);
                console.log(`private key read: ${privateKey}`);
                if (!!passphrase) {
                    await privateKey.decrypt(passphrase);
                }
            } catch (error) {
                var privateKey = false;
            }
            const { data: result } = await openpgp.encrypt({
                message: openpgp.message.fromText(text),
                publicKeys: (await openpgp.key.readArmored(key)).keys,
                privateKeys: !!privateKey ? [privateKey] : []
            });
        }
        core.setOutput("encrypted-text", result);
        core.exportVariable("encryptedText", result);
    } catch (error) {
        core.setFailed(error);
    }
}

run();

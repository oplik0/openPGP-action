const core = require("@actions/core");
const openpgp = require("openpgp");
const fs = require("fs");
async function run() {
    try {
        console.log("started");
        const inputText = core.getInput("text", { required: true }).toString();
        console.log(`input value: ${inputText}`);
        try {
            if (fs.existsSync(path)) {
                var text = fs.readFileSync(inputText);
            }
        } catch (err) {
            var text = inputText;
        }
        console.log(`text inputted: ${text}`);
        const keysource = core
            .getInput("keysource", { required: true })
            .toString();
        const useKeyserver = keysource === "keyserver" ? true : false;
        console.log(`keysource: ${keysource}`);
        const inputKey = core.getInput("key", { required: true }).toString();
        const isPrivate = !!inputKey.includes("PRIVATE KEY BLOCK");
        if (isPrivate) {
            var passphrase = core.getInput("passphrase").toString();
            console.log("inputted key is private and will be used for signing");
        } else {
            var privateInputKey = core.getInput("privateKey").toString();
        }
        const keyserver = core
            .getInput("keyserver", { required: false })
            .toString();
        console.log(`keyserver inputted: ${keyserver}`);
        if (useKeyserver) {
            var hkp = !!keyserver
                ? new openpgp.HKP(keyserver)
                : new openpgp.HKP();
            var key = await hkp.lookup({
                query: inputKey
            });
        } else {
            var key = inputKey;
        }
        if (isPrivate) {
            var {
                keys: [privateKey]
            } = await openpgp.key.readArmored(key);
            if (!!passphrase) {
                await privateKey.decrypt(passphrase);
            }
            var { data: result } = await openpgp.sign({
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
            var { data: result } = await openpgp.encrypt({
                message: openpgp.message.fromText(text),
                publicKeys: (await openpgp.key.readArmored(key)).keys,
                privateKeys: !!privateKey ? [privateKey] : []
            });
        }
        core.setOutput("encrypted-text", result);
        core.exportVariable("encryptedText", result);
    } catch (error) {
        core.setFailed(error.toString());
    }
}

run();
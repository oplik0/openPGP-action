const core = require("@actions/core");
const openpgp = require("openpgp");
const fs = require("fs");
global.fetch = require("node-fetch");

async function run() {
    try {
        console.log("started");
        const inputText = core.getInput("text", { required: true }).toString();
        try {
            if (fs.existsSync(path)) {
                var text = fs.readFileSync(inputText);
            }
        } catch (err) {
            var text = inputText;
        }
        const keysource = core
            .getInput("keysource", { required: true })
            .toString();
        const useKeyserver = keysource === "keyserver" ? true : false;
        console.log(`keysource: ${keysource}`);
        const inputKey = core.getInput("key", { required: true }).toString();
        const isPrivate = !!inputKey.includes("PRIVATE KEY BLOCK");
        if (isPrivate) {
            console.log("inputted key is private and will be used for signing");
        } else {
            var privateInputKey = core.getInput("privateKey").toString();
        }
        var passphrase = core.getInput("passphrase").toString();
        const keyserver = core
            .getInput("keyserver", { required: false })
            .toString();
        console.log(
            `keyserver used: ${
                !!keyserver ? keyserver : "https://keyserver.ubuntu.com"
            }`
        );
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
                var {
                    keys: [privateKey]
                } = await openpgp.key.readArmored(privateInputKey);
                if (!!passphrase) {
                    await privateKey.decrypt(passphrase);
                }
            } catch (error) {
                var privateKey = false;
            }
            const message = openpgp.message.fromText(text);
            const publicKeys = await openpgp.key.readArmored(key);
            var { data: result } = await openpgp.encrypt({
                message: message,
                publicKeys: publicKeys.keys,
                privateKeys: !!privateKey ? [privateKey] : []
            });
        }
        core.setOutput("encrypted-text", result);
        core.exportVariable("envEncryptedText", result);
    } catch (error) {
        core.setFailed(error.stack);
    }
}

run();

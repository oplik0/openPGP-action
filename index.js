"use strict";
const core = require("@actions/core");
const openpgp = require("openpgp");
const fs = require("fs");
try {
    const inputText = core.getInput("text", { required: true });
    try {
        if (fs.existsSync(path)) {
            var text = fs.readFileSync(inputText);
        }
    } catch (err) {
        var text = inputText;
    }
    core.debug(`text inputted: ${text}`);
    const useKeyserver =
        core.getInput("text", { required: true }) === "keyserver"
            ? true
            : false;
    const inputKey = core.getInput("key", { required: true });
    const isPrivate = !!key.includes("PRIVATE KEY BLOCK");
    if (isPrivate) {
        const passphrase = core.getInput("passphrase");
        console.log("inputted key is private and will be used for signing");
    } else {
        const privateInputKey = core.getInput("privateKey");
    }
    core.debug(`key inputted: ${key}`);
    const keyserver = core.getInput("keyserver", { required: false });
    core.debug(`keyserver inputted: ${keyserver}`)(async () => {
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
            var privateKey = await openpgp.key.readArmored(key);
            if (!!passphrase) {
                await privateKey.decrypt(passphrase);
            }
            const result = await openpgp.sign({
                message: openpgp.cleartext.fromText(text),
                privateKeys: [privateKey]
            });
        } else {
            try {
                var privateKey = await openpgp.key.readArmored(privateInputKey);
                core.debug(`private key read: ${privateKey}`);
                if (!!passphrase) {
                    await privateKey.decrypt(passphrase);
                }
            } catch (error) {
                var privateKey = false;
            }
            const result = await openpgp.encrypt({
                message: openpgp.message.fromText(text),
                publicKeys: await openpgp.key.readArmored(key),
                privateKeys: !!privateKey ? [privateKey] : []
            });
        }
        core.setOutput("encrypted-text", result);
        core.exportVariable("encryptedText", result);
    })();
} catch (error) {
    core.setFailed(error);
}

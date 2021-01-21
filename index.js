const core = require("@actions/core");
const openpgp = require("openpgp");
const fs = require("fs");
global.fetch = require("node-fetch");

async function run() {
    try {
        core.info("started");
        const inputText = core.getInput("text", { required: true }).toString();
        core.debug(`text inputted: ${inputText}`);
        try {
            if (fs.existsSync(inputText)) {
                core.debug("text is a valid filepath, reading the file");
                var text = fs.readFileSync(inputText);
            } else {
                core.debug("text is not a valid filepath, leaving as a string");
                var text = inputText;
            }
        } catch (err) {
            core.debug("text is not a valid filepath, leaving as a string");
            var text = inputText;
        }
        const keysource = core
            .getInput("keysource", { required: true })
            .toString();
        const useKeyserver = keysource === "keyserver" ? true : false;
        core.info(`keysource: ${keysource}`);
        const inputKey = core.getInput("key", { required: true }).toString();
        core.debug(`Key inputted: ${inputKey}`);
        const isPrivate = !!inputKey.includes("PRIVATE KEY BLOCK");
        core.debug(!!isPrivate ? "Key is private" : "key is not private");
        if (isPrivate) {
            core.info(
                "inputted key is private and will be used for signing, and not encryption"
            );
        } else {
            var privateInputKey = core.getInput("privateKey").toString();
        }
        var passphrase = core.getInput("passphrase").toString();
        const keyserver = core
            .getInput("keyserver", { required: false })
            .toString();
        core.info(
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
            core.debug(`key retrieved from keyserver: ${key}`);
        } else {
            var key = inputKey;
        }
        if (isPrivate) {
            core.debug("signing the message");
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
                core.debug(
                    `private key used alongside the public one: ${privateKey}`
                );
                if (!!passphrase) {
                    await privateKey.decrypt(passphrase);
                }
            } catch (error) {
                core.debug(
                    "private key will not be used for signing the encrypted message"
                );
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

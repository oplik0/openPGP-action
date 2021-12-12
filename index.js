const core = require("@actions/core");
const openpgp = require("openpgp");
const HKP = require("@openpgp/hkp-client");
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
            var hkp = !!keyserver ? new HKP(keyserver) : new HKP();
            var key = await hkp.lookup({
                query: inputKey,
            });
            core.debug(`key retrieved from keyserver: ${key}`);
        } else {
            var key = inputKey;
        }
        if (isPrivate) {
            core.debug("signing the message");
            var privateKey = await openpgp.key.readPrivateKey({
                armoredKey: key,
            });
            if (!!passphrase) {
                await privateKey.decrypt(passphrase);
            }
            var { data: result } = await openpgp.sign({
                message: await openpgp.createCleartextMessage({ text }),
                signingKeys: [privateKey],
            });
        } else {
            try {
                var privateKey = await openpgp.key.readPrivateKey({
                    armoredKey: privateInputKey,
                });
                core.debug(`private key used alongside the public one`);
                if (!!passphrase) {
                    await privateKey.decrypt(passphrase);
                }
            } catch (error) {
                core.debug(
                    "private key will not be used for signing the encrypted message"
                );
                var privateKey = false;
            }
            const message = await openpgp.createMessage({
                text,
                date: new Date(),
            });
            const publicKeys = await openpgp.key.readKeys({ armoredKeys: key });
            var { data: result } = await openpgp.encrypt({
                message: message,
                encryptionKeys: publicKeys.keys,
                signingKeys: !!privateKey ? [privateKey] : [],
            });
        }
        core.setOutput("encrypted-text", result);
        core.exportVariable("envEncryptedText", result);
    } catch (error) {
        core.setFailed(error.stack);
    }
}

run();

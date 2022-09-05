import * as core from "@actions/core";
import { HKP } from "@openpgp/hkp-client";
import { access, readFile } from "node:fs/promises";
import { createCleartextMessage, createMessage, decryptKey, encrypt, readKey, readPrivateKey, sign } from "openpgp";
import type { Key, PrivateKey, PublicKey } from "openpgp";
async function getKey(key: string): Promise<string | null> {
	if (!key.length) return null;
	const keysource = core.getInput("keysource", { required: true });
	core.info(`[OpenPGP Action] keysource: ${keysource}`);
	switch (keysource) {
		case "keyserver":
			const keyserver = core.getInput("keyserver", { required: false });
			const query = key;
			const hkp = new HKP(keyserver.length ? keyserver : undefined);
			return await hkp.lookup({ query }) ?? null;
		case "file":
			const file = (await readFile(key)).toString("utf-8");
			return file.length ? file : null;
		case "key":
		default:
			return key.length ? key : null;
	}
}

try {
	core.info("[OpenPGP Action] started");

	// Get main key
	const key = core.getInput("key", { required: true });
	const armoredKey = await getKey(key);
	if (!armoredKey) throw new Error("[OpenPGP Action] No key found");
	let unknownKey: Key = await readKey({ armoredKey });

	// Handle private/public key
	let privateKey: PrivateKey | undefined = undefined;
	let publicKey: PublicKey | undefined = undefined;

	if (unknownKey.isPrivate()) {
		core.info("[OpenPGP Action] inputted key is private and will be used for signing");
		privateKey = await readPrivateKey({ armoredKey });
	} else {
		// public key will be used for encryption
		core.info("[OpenPGP Action] inputted key is public and will be used for encryption");
		publicKey = unknownKey;

		// if private key is provided too, use it for signing
		const privateInputKey = core.getInput("privateKey", { required: false });
		const armoredPrivateKey = await getKey(privateInputKey);
		if (armoredPrivateKey) {
			core.info("[OpenPGP Action] additional private key that will be used for signing was provided");
			privateKey = await readPrivateKey({ armoredKey: armoredPrivateKey });
			if (!privateKey.isPrivate()) throw new Error("[OpenPGP Action] inputted private key is not private");
		}
	}

	// Decrypt key if needed
	const passphrase = core.getInput("passphrase", { required: false });
	if (passphrase && privateKey) {
		privateKey = await decryptKey({ privateKey, passphrase });
	}

	// Get the message text
	let text = core.getInput("text", { required: true });
	try {
		text = (await readFile(text)).toString("utf-8");
		core.debug("[OpenPGP Action] text is a valid filepath, reading the file");
	} catch (e) {
		core.debug("[OpenPGP Action] text is not a valid filepath, leaving it as a string");
	}

	// Encrypt/sign the message
	let result;
	if (publicKey) {
		const message = await createMessage({ text });
		result = await encrypt({
			message,
			encryptionKeys: [publicKey],
			signingKeys: privateKey ? [privateKey] : undefined,
		});
	} else if (privateKey) {
		const message = await createCleartextMessage({ text });
		result = await sign({ message, signingKeys: [privateKey] });
	} else {
		throw new Error("[OpenPGP Action] No key found");
	}

	core.setOutput("encrypted-text", result);
	core.exportVariable("envEncryptedText", result);
	core.info("[OpenPGP Action] finished");
} catch (e: unknown) {
	core.setFailed(e instanceof Error ? e.message : "Unknown error");
}

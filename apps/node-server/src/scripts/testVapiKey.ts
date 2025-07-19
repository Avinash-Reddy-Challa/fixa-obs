import { VapiClient } from "@vapi-ai/server-sdk";

async function testKeys() {
  const privateKey = "26435740-5075-4da2-9a3d-655dcd940dcb";
  const publicKey = "2ddb864b-5735-49f6-818c-e5ede9b5ef6f";

  console.log("Testing private key...");
  try {
    const vapiPrivate = new VapiClient({ token: privateKey });
    const assistants = await vapiPrivate.assistants.list();
    console.log("✅ Private key works! Found", assistants.length, "assistants");
  } catch (error: any) {
    console.log("❌ Private key failed:", error.message);
  }

  console.log("\nTesting public key...");
  try {
    const vapiPublic = new VapiClient({ token: publicKey });
    const assistants = await vapiPublic.assistants.list();
    console.log("✅ Public key works! Found", assistants.length, "assistants");
  } catch (error: any) {
    console.log("❌ Public key failed:", error.message);
  }
}

testKeys().catch(console.error);

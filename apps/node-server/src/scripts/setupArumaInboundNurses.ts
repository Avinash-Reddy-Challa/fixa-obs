// apps/node-server/src/scripts/setupArumaInboundNurses.ts
import { VapiService } from "../../../../packages/services/src/vapi";
import { db } from "../db";
import { env } from "../env";

// Your Vapi API Keys
const VAPI_PRIVATE_KEY = "26435740-5075-4da2-9a3d-655dcd940dcb";
const VAPI_PUBLIC_KEY = "1c8fca88-5c28-4c94-9eb7-ee0ad651726f";

// Initialize VapiService
const vapiService = new VapiService(db);

// Voice ID mapping for each nurse
const NURSE_VOICE_IDS = {
    "sarah-nurse-experienced": "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional female
    "mike-nurse-busy": "ErXwobaYiN019PkySvjV",         // Antoni - Professional male  
    "linda-nurse-detailed": "EXAVITQu4vr4xnSDxMaL",   // Bella - Clear female
};

async function setupInboundNurseAgents() {
    console.log("🏥 Setting up Aruma Health inbound nurse test agents...");
    console.log(`🔐 Using Vapi Private Key: ${VAPI_PRIVATE_KEY}`);
    console.log("");

    try {
        // Get the nurse test agents from the database
        const nurseAgents = await db.testAgent.findMany({
            where: {
                name: {
                    in: ["sarah-nurse-experienced", "mike-nurse-busy", "linda-nurse-detailed"]
                },
                ownerId: "SYSTEM"
            }
        });

        if (nurseAgents.length === 0) {
            console.log("❌ No nurse test agents found in database.");
            console.log("   Please run the seed script first: pnpm run db:seed");
            return;
        }

        console.log(`📋 Found ${nurseAgents.length} nurse agents in database`);
        console.log("");

        for (const nurseAgent of nurseAgents) {
            try {
                console.log(`⚙️ Setting up inbound capabilities for: ${nurseAgent.name}`);

                let vapiAssistantId = nurseAgent.customerAgentId;

                // If no Vapi assistant exists, create one
                if (!vapiAssistantId) {
                    console.log(`🤖 Creating Vapi assistant for ${nurseAgent.name}...`);

                    const voiceId = NURSE_VOICE_IDS[nurseAgent.name as keyof typeof NURSE_VOICE_IDS];
                    if (!voiceId) {
                        console.log(`❌ No voice ID found for ${nurseAgent.name}`);
                        continue;
                    }

                    // Create Vapi assistant using VapiService
                    const vapiAssistant = await vapiService.createOrUpdateVapiAssistant(
                        nurseAgent.prompt,
                        nurseAgent.name,
                        voiceId,
                        true // isSystemTemplate
                    );

                    vapiAssistantId = vapiAssistant.id;

                    // Update the database record with the Vapi assistant ID
                    await db.testAgent.update({
                        where: { id: nurseAgent.id },
                        data: {
                            customerAgentId: vapiAssistantId
                        }
                    });

                    console.log(`✅ Created Vapi assistant: ${vapiAssistantId}`);
                } else {
                    console.log(`✅ Found existing Vapi assistant: ${vapiAssistantId}`);
                }

                // Update test agent with inbound configuration metadata
                await db.testAgent.update({
                    where: { id: nurseAgent.id },
                    data: {
                        metadata: {
                            type: "aruma_inbound_nurse",
                            vapiAssistantId: vapiAssistantId,
                            phoneNumber: null, // Will be assigned manually in Vapi dashboard
                            voiceId: NURSE_VOICE_IDS[nurseAgent.name as keyof typeof NURSE_VOICE_IDS],
                            vapiKeys: {
                                private: VAPI_PRIVATE_KEY,
                                public: VAPI_PUBLIC_KEY
                            },
                            setup: {
                                createdAt: new Date().toISOString(),
                                nodeServerUrl: env.NODE_SERVER_URL,
                                webhookSecret: env.NODE_SERVER_SECRET
                            },
                            inboundConfig: {
                                enabled: true,
                                maxDurationSeconds: 900, // 15 minutes
                                recordingEnabled: true,
                                webhookUrl: `${env.NODE_SERVER_URL}/private/vapi`,
                            },
                            patientScenario: getPatientScenario(nurseAgent.name)
                        }
                    }
                });

                console.log(`✅ Successfully configured ${nurseAgent.name} for inbound calls`);
                console.log(`   🆔 Vapi Assistant ID: ${vapiAssistantId}`);
                console.log(`   🎤 Voice ID: ${NURSE_VOICE_IDS[nurseAgent.name as keyof typeof NURSE_VOICE_IDS]}`);
                console.log(`   📞 Phone Number: Manual assignment required in Vapi dashboard`);
                console.log("");

            } catch (error) {
                console.error(`❌ Error setting up ${nurseAgent.name}:`, error);
            }
        }

        // Display summary and next steps
        console.log("📋 SETUP COMPLETE - Summary:");
        console.log("=".repeat(60));

        const configuredAgents = await db.testAgent.findMany({
            where: {
                name: {
                    in: ["sarah-nurse-experienced", "mike-nurse-busy", "linda-nurse-detailed"]
                }
            }
        });

        configuredAgents.forEach((agent, index) => {
            console.log(`${index + 1}. ${agent.name}`);
            console.log(`   🤖 Assistant ID: ${agent.customerAgentId}`);
            console.log(`   📋 Patient Scenario: ${getPatientScenario(agent.name)}`);
            console.log(`   🎤 Voice: ${getVoiceDescription(agent.name)}`);
            console.log(`   📞 Phone: Requires manual assignment in Vapi dashboard`);
            console.log("");
        });

        console.log("🔄 REQUIRED MANUAL STEPS:");
        console.log("1. Go to your Vapi dashboard (https://dashboard.vapi.ai)");
        console.log("2. Navigate to Phone Numbers section");
        console.log("3. Create or assign phone numbers to each assistant:");
        configuredAgents.forEach((agent, index) => {
            console.log(`   - Assistant: ${agent.customerAgentId} (${agent.name})`);
        });
        console.log("4. Update the assistant webhooks to point to your server:");
        console.log(`   - Webhook URL: ${env.NODE_SERVER_URL}/private/vapi`);
        console.log(`   - Webhook Secret: ${env.NODE_SERVER_SECRET}`);
        console.log("");
        console.log("🧪 TESTING:");
        console.log("   Run: npx tsx src/scripts/setupArumaInboundNurses.ts test");
        console.log("");
        console.log("🎯 INTEGRATION WITH ARUMA:");
        console.log("   After assigning phone numbers, configure your Aruma agent to call:");
        console.log("   - Sarah (detailed updates): [Phone from Vapi dashboard]");
        console.log("   - Mike (quick updates): [Phone from Vapi dashboard]");
        console.log("   - Linda (comprehensive updates): [Phone from Vapi dashboard]");

    } catch (error) {
        console.error("❌ Setup failed:", error);
    }
}

function getPatientScenario(agentName: string): string {
    switch (agentName) {
        case "sarah-nurse-experienced":
            return "Maria Rodriguez (67F, Post-Cardiac Surgery CABG, Day 3)";
        case "mike-nurse-busy":
            return "James Wilson (45M, Post-Appendectomy, Day 1)";
        case "linda-nurse-detailed":
            return "Robert Kim (72M, Diabetic Foot Ulcer Care)";
        default:
            return "Unknown patient scenario";
    }
}

function getVoiceDescription(agentName: string): string {
    switch (agentName) {
        case "sarah-nurse-experienced":
            return "Rachel (Professional Female)";
        case "mike-nurse-busy":
            return "Antoni (Professional Male)";
        case "linda-nurse-detailed":
            return "Bella (Clear Female)";
        default:
            return "Unknown voice";
    }
}

async function testNurseAgentSetup() {
    console.log("🧪 Testing Aruma nurse agent setup...");
    console.log("");

    try {
        const nurseAgents = await db.testAgent.findMany({
            where: {
                name: {
                    in: ["sarah-nurse-experienced", "mike-nurse-busy", "linda-nurse-detailed"]
                }
            }
        });

        if (nurseAgents.length === 0) {
            console.log("❌ No configured nurse agents found.");
            console.log("   Run setup first: npx tsx src/scripts/setupArumaInboundNurses.ts");
            return;
        }

        console.log("📞 Configured nurse agents for your Aruma agent to call:");
        console.log("-".repeat(60));

        nurseAgents.forEach((agent, index) => {
            console.log(`${index + 1}. ${agent.name}`);
            console.log(`   Assistant ID: ${agent.customerAgentId || 'NOT CREATED'}`);
            console.log(`   Patient: ${getPatientScenario(agent.name)}`);
            console.log(`   Voice: ${getVoiceDescription(agent.name)}`);
            console.log(`   Phone: Manual assignment required`);
            console.log(`   Use case: ${getUseCase(agent.name)}`);
            console.log("");
        });

        console.log("🔧 Integration Instructions for your Aruma agent:");
        console.log("1. Get phone numbers from Vapi dashboard for each assistant");
        console.log("2. Configure your Aruma agent to call these numbers");
        console.log("3. Test conversation flow:");
        console.log("   - Aruma calls nurse number");
        console.log("   - Nurse answers: 'Hello, this is [nurse name], RN'");
        console.log("   - Aruma: 'Hi, this is Veda from Aruma Health...'");
        console.log("   - Nurse provides patient update based on scenario");
        console.log("4. Monitor results in your Fixa dashboard");
        console.log("");
        console.log("📊 All calls will be recorded and analyzed through your existing Fixa pipeline");

        // Check if any agents are missing Vapi assistants
        const missingVapi = nurseAgents.filter(agent => !agent.customerAgentId);
        if (missingVapi.length > 0) {
            console.log("");
            console.log("⚠️ WARNING: Some agents missing Vapi assistants:");
            missingVapi.forEach(agent => {
                console.log(`   - ${agent.name}: Run setup script to create Vapi assistant`);
            });
        }

    } catch (error) {
        console.error("❌ Error testing setup:", error);
    }
}

function getUseCase(agentName: string): string {
    switch (agentName) {
        case "sarah-nurse-experienced":
            return "Test detailed, comprehensive medical updates";
        case "mike-nurse-busy":
            return "Test brief, efficient responses";
        case "linda-nurse-detailed":
            return "Test very thorough, methodical updates";
        default:
            return "General nurse interaction testing";
    }
}

// Main execution
if (require.main === module) {
    const command = process.argv[2];

    if (command === 'test') {
        testNurseAgentSetup().catch(console.error);
    } else {
        setupInboundNurseAgents().catch(console.error);
    }
}

export { setupInboundNurseAgents, testNurseAgentSetup };
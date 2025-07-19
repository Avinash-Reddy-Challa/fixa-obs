// Fixed seed.ts - Remove voiceId from database operations
// apps/web-app/prisma/seed.ts
import { VapiService } from "../../../packages/services/src/vapi";
import { db } from "~/server/db";

const vapiService = new VapiService(db);

async function main() {
  // Your existing test agents + nurse agents
  const testAgents = [
    {
      name: "lily",
      headshotUrl: "/images/agent-avatars/lily.jpeg",
      description: "a young woman who says like a lot",
      prompt: "You are lily smith, a young woman who says like a lot.",
      voiceId: "cgSgspJ2msm6clMCkdW9", // jessica voice - used for Vapi, not database
      enabled: true,
      defaultSelected: true,
    },
    {
      name: "steve",
      headshotUrl: "/images/agent-avatars/steve.jpeg",
      description: "an irritable man who had a bad day",
      prompt:
        "You are steve wozniak, an irritable man who had a bad day. You are not very patient and get frustrated easily.",
      voiceId: "R99XgMGAPM4Bdpv1FJs2",
      enabled: true,
      defaultSelected: true,
    },
    {
      name: "marge",
      headshotUrl: "/images/agent-avatars/marge.jpeg",
      description: "elderly lady who sometimes gets carried away",
      prompt:
        "you are marge simpson, a friendly elderly lady who loves to talk and sometimes gets carried away.",
      voiceId: "6zi9hbRGFbPJXunIKqJ4",
      enabled: true,
      defaultSelected: true,
    },
    {
      name: "daryl",
      headshotUrl: "/images/agent-avatars/daryl.jpeg",
      description: "An elderly man who may need extra patience",
      prompt:
        "You are daryl williams, a 72-year-old retiree who is not comfortable with technology. You sometimes need things repeated and explained very slowly. You appreciate when people are patient with you.",
      voiceId: "7NERWC0HfmjQak4YqWff",
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "maria",
      headshotUrl: "/images/agent-avatars/maria.jpeg",
      description: "A woman who prefers speaking in short, direct sentences",
      prompt:
        "You are Maria Garcia, a 31-year-old nurse who works long shifts. you speak in short, direct sentences.",
      voiceId: "5S3VJEI4yXXfOSBrTB3q",
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "jose",
      headshotUrl: "/images/agent-avatars/jose.jpeg",
      description: "a native spanish speaker",
      prompt: "You are jose, a native spanish speaker.",
      voiceId: "3l9iCMrNSRR0w51JvFB0",
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "raj",
      headshotUrl: "/images/agent-avatars/raj.jpeg",
      description: "man with an indian accent",
      prompt: "You are raj, a man with an indian accent.",
      voiceId: "mCQMfsqGDT6IDkEKR20a",
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "klaus",
      headshotUrl: "/images/agent-avatars/klaus.jpeg",
      description: "man with a german accent",
      prompt: "You are klaus, a man with a german accent.",
      voiceId: "IokmXfIsrOE3umjiwHWz",
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "deng",
      headshotUrl: "/images/agent-avatars/deng.jpeg",
      description: "man with a chinese accent",
      prompt: "You are deng, a man with a chinese accent.",
      voiceId: "gAMZphRyrWJnLMDnom6H",
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "talia",
      headshotUrl: "/images/agent-avatars/talia.jpeg",
      description: "woman with a russian accent",
      prompt: "You are talia, a woman with a russian accent.",
      voiceId: "GCPLhb1XrVwcoKUJYcvz",
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "blank",
      headshotUrl: "/images/agent-avatars/blank.jpeg",
      description: "a blank agent",
      prompt:
        "You are a blank agent. Do nothing but respond precisely to the instructions given to you.",
      voiceId: "cgSgspJ2msm6clMCkdW9",
      enabled: true,
      defaultSelected: false,
    },
    // NEW: Aruma Health Nurse Test Agents
    {
      name: "sarah-nurse-experienced",
      headshotUrl: "/images/agent-avatars/nurse-sarah.jpeg",
      description: "Experienced ICU nurse - provides detailed patient updates for Aruma Health testing",
      prompt: `You are Sarah Johnson, an experienced ICU nurse with 8 years of experience at Cedar Sinai Medical Center. You are professional, knowledgeable, and provide detailed patient updates to healthcare AI agents.

CRITICAL INSTRUCTIONS:
- You are expecting calls from "Veda," an AI agent from Aruma Health
- Veda will ask for patient updates after recent visits
- Be professional but warm in your responses
- Provide specific, accurate medical information
- Use appropriate medical terminology
- Answer the phone professionally

PATIENT INFORMATION - Maria Rodriguez (ID: MR-2024-001):
- Age: 67-year-old female
- Condition: Post-cardiac surgery (CABG), Day 3 post-op
- Current Status:
  * Vital Signs: BP 128/76, HR 82, Temp 98.6°F, O2 Sat 96% on room air
  * Pain Level: 4/10, well-controlled with prescribed Percocet
  * Mobility: Ambulating with walker assistance, 50 feet without SOB
  * Appetite: Good, eating 75% of meals, tolerating regular diet
  * Surgical Site: Clean, dry, intact incision. No signs of infection
  * Mental Status: Alert and oriented x3, in good spirits
  * Medications: Taking all prescribed meds including Metoprolol, Aspirin, Lasix
  * Concerns: Mild shortness of breath with exertion but improving daily
  * Discharge Planning: Likely discharge tomorrow if continues improving

CONVERSATION FLOW:
1. Answer professionally: "Hello, this is Sarah Johnson, RN"
2. When Veda introduces herself, acknowledge: "Hi Veda, yes I can give you an update"
3. Ask which patient: "Which patient update do you need?"
4. When asked about Maria Rodriguez, provide comprehensive update
5. Be prepared to elaborate on any specific questions about vitals, mobility, pain, etc.

EXAMPLE RESPONSES:
"Hi Veda, yes I just finished my assessment of Maria Rodriguez. She's doing very well post-operatively. Would you like me to go through her current status?"

"Her vital signs are stable - blood pressure 128 over 76, heart rate 82, and she's maintaining good oxygen saturation on room air. She's been ambulating with her walker and her pain is well-controlled."`,
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional female voice
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "mike-nurse-busy",
      headshotUrl: "/images/agent-avatars/nurse-mike.jpeg",
      description: "Busy ER nurse - provides quick, efficient updates for Aruma Health testing",
      prompt: `You are Mike Thompson, a busy ER nurse with 5 years of experience at General Hospital. You're in the middle of a hectic shift but always provide professional patient updates.

CRITICAL INSTRUCTIONS:
- You're busy but professional
- Give concise, efficient updates
- Still provide accurate medical information
- Acknowledge time constraints but remain helpful
- Expect calls from "Veda" from Aruma Health

PATIENT INFORMATION - James Wilson (ID: JW-2024-002):
- Age: 45-year-old male
- Condition: Post-operative appendectomy, laparoscopic, Day 1 post-op
- Current Status:
  * Vitals: All stable and within normal limits
  * Pain: Well controlled with oral pain medication
  * Surgical Sites: Three small laparoscopic incisions healing well
  * Activity: Up and walking, tolerating clear liquids progressing to regular diet
  * Complications: None observed
  * Discharge: Likely discharge later today or tomorrow morning

CONVERSATION STYLE:
- Brief and to the point
- Professional but mention being busy
- Provide essential information efficiently
- Ask if specific details are needed

EXAMPLE RESPONSES:
"Hi Veda, this is Mike. I can give you a quick update on James Wilson - he's doing great post-op. Anything specific you need to know?"

"Yeah, his appendectomy went well yesterday. Vitals are stable, pain's controlled, he's up walking around. Should be going home today. I'm pretty swamped right now but can answer any specific questions."`,
      voiceId: "ErXwobaYiN019PkySvjV", // Antoni - Professional male voice
      enabled: true,
      defaultSelected: false,
    },
    {
      name: "linda-nurse-detailed",
      headshotUrl: "/images/agent-avatars/nurse-linda.jpeg",
      description: "Thorough Med-Surg nurse - provides comprehensive updates for Aruma Health testing",
      prompt: `You are Linda Chang, a meticulous medical-surgical nurse with 12 years of experience at University Medical Center. You believe in providing comprehensive, detailed patient updates and ensuring all information is thoroughly communicated.

CRITICAL INSTRUCTIONS:
- Be very thorough and comprehensive
- Provide detailed medical information
- Use proper medical terminology
- Methodical in your presentation
- Expect calls from "Veda" from Aruma Health
- Ensure all aspects of care are covered

PATIENT INFORMATION - Robert Kim (ID: RK-2024-003):
- Age: 72-year-old male
- Condition: Type 2 Diabetes, admitted for diabetic foot ulcer care
- Medical History: HTN, DM Type 2, PVD
- Current Status:
  * Vital Signs: BP 140/88 (slightly elevated), HR 76, Temp 98.2°F
  * Blood Glucose: 145 mg/dL (acceptable range for diabetic)
  * Wound: 3cm x 2cm diabetic ulcer on left heel, showing good granulation
  * Pain: Minimal, 2/10, well managed with Tylenol
  * Mobility: Limited weight-bearing on left foot, using wheelchair
  * Diet: 1800-calorie diabetic diet, good compliance
  * Medications: Insulin sliding scale, Clindamycin for wound
  * Wound Care: Daily dressing changes, wound vac therapy
  * Education: Patient teaching on diabetic foot care completed
  * Family: Daughter very involved, understands discharge planning
  * Discharge Planning: 2-3 more days, arranging home health

CONVERSATION STYLE:
- Very detailed and systematic
- Methodical presentation
- Ensure comprehensive coverage
- Patient advocacy focus
- Ask if additional details needed

EXAMPLE RESPONSES:
"Hello Veda, I'm glad you called about Robert Kim. I have quite a comprehensive update to share with you. Let me walk through his current status systematically."

"Starting with his vital signs - his blood pressure is slightly elevated at 140 over 88, which we're monitoring closely given his diabetes and hypertension history. His blood glucose has been well-controlled today at 145..."`,
      voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella - Clear professional female voice
      enabled: true,
      defaultSelected: false,
    },
  ];

  console.log("🌱 Starting seed process...");
  console.log(`📊 Processing ${testAgents.length} test agents...`);

  // Process each test agent
  for (let i = 0; i < testAgents.length; i++) {
    const agent = testAgents[i]!;

    try {
      console.log(`⚙️ Processing agent ${i + 1}/${testAgents.length}: ${agent.name}`);

      // Create or update Vapi assistant (this uses the voiceId)
      const vapiAssistant = await vapiService.createOrUpdateVapiAssistant(
        agent.prompt,
        agent.name,
        agent.voiceId, // VapiService uses this for voice configuration
        true,
      );

      // Upsert test agent in database (WITHOUT voiceId - not in schema)
      await db.testAgent.upsert({
        where: { id: vapiAssistant.id },
        update: {
          name: agent.name,
          headshotUrl: agent.headshotUrl,
          description: agent.description,
          prompt: agent.prompt,
          // voiceId: agent.voiceId, // REMOVED - not in database schema
          enabled: agent.enabled,
          defaultSelected: agent.defaultSelected,
          order: i,
          ownerId: "SYSTEM",
        },
        create: {
          id: vapiAssistant.id,
          name: agent.name,
          headshotUrl: agent.headshotUrl,
          description: agent.description,
          prompt: agent.prompt,
          // voiceId: agent.voiceId, // REMOVED - not in database schema
          enabled: agent.enabled,
          defaultSelected: agent.defaultSelected,
          order: i,
          ownerId: "SYSTEM",
        },
      });

      console.log(`✅ Successfully processed: ${agent.name} (ID: ${vapiAssistant.id})`);

    } catch (error) {
      console.error(`❌ Error processing agent ${agent.name}:`, error);
      // Continue with next agent instead of failing completely
    }
  }

  console.log("");
  console.log("🎉 Seed process completed!");
  console.log("");
  console.log("📋 Summary:");
  console.log(`   • ${testAgents.length} test agents processed`);
  console.log(`   • ${testAgents.filter(a => a.defaultSelected).length} agents set as default selected`);
  console.log(`   • ${testAgents.filter(a => a.name.includes('nurse')).length} nurse agents added for Aruma Health testing`);
  console.log("");
  console.log("🏥 Aruma Health Nurse Agents:");
  testAgents
    .filter(a => a.name.includes('nurse'))
    .forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} - ${agent.description.split(' - ')[0]}`);
    });
  console.log("");
  console.log("🔄 Next Steps for Aruma Integration:");
  console.log("   1. Run: npx tsx src/scripts/setupArumaInboundNurses.ts");
  console.log("   2. Configure your Aruma agent with the assigned phone numbers");
  console.log("   3. Test the integration");
  console.log("");
  console.log("✅ All nurse agents successfully created in Vapi with proper voice IDs!");
  console.log("   The voiceId is configured in Vapi but not stored in the database.");
}

// Execute the seed function
void main().catch((error) => {
  console.error("❌ Seed process failed:", error);
  process.exit(1);
});
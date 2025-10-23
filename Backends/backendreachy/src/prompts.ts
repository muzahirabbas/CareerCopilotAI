interface UserInfo {
    userName: string;
    githubLink?: string;
    websiteLink?: string;
    linkedinLink?: string;
    profession?: string;
}

interface AfterApplyingData {
    userInfo: UserInfo;
    recipientName: string;
    recipientRole: 'Executive at company' | 'university fellow in company' | 'friend / aquaintance from company';
    universityName?: string;
    companyName: string;
    recipientPosition?: string;
    jobTitle: string;
    messageType: 'detailed email' | 'short message' | 'short linkedin message' | 'one liner 200 characters connection request message';
    aboutJob?: string;
    aboutCompany?: string;
}

interface ExpandNetworkData {
    userInfo: UserInfo;
    recipientName: string;
    relationship: 'friend' | 'fb frnd' | 'aquaintance' | 'relative' | 'colleague' | 'classmate' | 'uni fellow';
    contexts: string[]; // e.g., ['switching fields', 'updated porfolio', 'looking for job opportunities']
    messageType: 'detailed email' | 'short whatsapp casual message' | 'short linkedin message' | 'one liner message';
}

function formatLinks(userInfo: UserInfo): string {
    let linkText = "";
    if (userInfo.linkedinLink) linkText += `\n- LinkedIn: ${userInfo.linkedinLink}`;
    if (userInfo.githubLink) linkText += `\n- GitHub: ${userInfo.githubLink}`;
    if (userInfo.websiteLink) linkText += `\n- Portfolio/Website: ${userInfo.websiteLink}`;
    return linkText.trim() ? `Here are my professional links for reference:\n${linkText.trim()}` : "";
}

export function getAfterApplyingPrompt(data: AfterApplyingData): string {
    const { userInfo, recipientName, recipientRole, universityName, companyName, recipientPosition, jobTitle, messageType, aboutJob, aboutCompany } = data;

    const linkSection = formatLinks(userInfo);

    let prompt = `You are a professional communication expert named ReachyAI, specializing in concise, natural, and personalized outreach writing. Your goal is to craft a clear, context-aware message that feels written by a thoughtful human — not an AI.

---

**MY DETAILS**
- Name: ${userInfo.userName}

**RECIPIENT DETAILS**
${recipientName ? `- Recipient's Name: ${recipientName}` : ''}
${companyName ? `- Company: ${companyName}` : ''}
${recipientRole ? `- My Relationship to Recipient: ${recipientRole}` : ''}
${recipientPosition ? `- Recipient's Position: ${recipientPosition}` : ''}
${universityName && recipientRole === 'university fellow in company' ? `- Shared University: ${universityName}` : ''}

**CONTEXT**
- Role I applied for: ${jobTitle}
${aboutCompany ? `- My thoughts on the company: "${aboutCompany}"` : ''}
${aboutJob ? `- My thoughts on the job: "${aboutJob}"` : ''}

---

**TASK**
Write a **${messageType}** that:
- Builds connection and shows genuine interest in the role and company.
- Naturally weaves in any provided thoughts (about job or company) if available.
- References a shared university early, if applicable.
- Never includes or invents placeholders (e.g., “[Your Name]” or “[Company Name]”).
- Omits any section where no data is provided.
- Avoids AI-sounding phrasing and keeps tone human, concise, and authentic.

---

**TONE AND FORMATTING RULES**
1. **No Setup Text:** Output *only* the final message — no headers, “Here’s your message,” or explanations.
2. **Personalization:** Use my name (“${userInfo.userName}”) directly.
3. **Dynamic Linking:**  
   - If "${linkSection}" is provided and the message type is **"detailed email"** or **"short linkedin message"**, list links neatly in bullet points at the *end of the message* under a small “Links:” label.  
   - For **"one liner 200 characters connection request message"**, omit links entirely.
4. **Tone by Message Type:**
   - **detailed email:** professional, courteous, structured (subject, greeting, body, sign-off).  
   - **short linkedin message:** conversational, concise (4–5 lines), friendly-professional balance.  
   - **one liner 200 characters connection request message:** under 200 characters, clear intent, no filler.

---

${linkSection ? `\n**My Links (for your reference):**\n${linkSection}` : ''}

Now generate the outreach message following all rules exactly.
`;

    return prompt;
}


export function getExpandNetworkPrompt(data: ExpandNetworkData): string {
    const { userInfo, recipientName, relationship, contexts, messageType } = data;

    const contextString = contexts.join(', ');
    const linkSection = formatLinks(userInfo);

    let prompt = `You are a friendly yet professional communication expert named ReachyAI.  
Your job is to craft a **personalized outreach message** that feels warm, genuine, and human — never robotic or templated.

---

**MY DETAILS**
- Name: ${userInfo.userName}
${userInfo.profession ? `- Profession: ${userInfo.profession}` : ''}

**RECIPIENT DETAILS**
${recipientName ? `- Recipient's Name: ${recipientName}` : ''}
${relationship ? `- My Relationship to Recipient: ${relationship}` : ''}

**CONTEXT**
${contextString ? `- Purpose of Outreach: ${contextString}` : ''}
- Goal: Reconnect, share a brief professional update, and remind them to keep me in mind for relevant opportunities.

---

**TASK**
Write a **${messageType}** that:
- Feels personal and contextually relevant to our relationship (${relationship || 'general professional connection'}).  
- Avoids any placeholders like “[Your Name]” or “[Recipient Name]”.  
- Omits any section for which no data is provided (no weird empty lines).  
- Keeps tone friendly, human, and natural — not stiff, salesy, or overly formal.  
- Never invents details I didn’t provide.  
- Ends gracefully, leaving room for a natural reply or future conversation.

---

**TONE AND FORMATTING RULES**
1. **Direct Output:** Only output the message text — no “Here’s your message” or commentary.  
2. **Personalization:** Always use my name (“${userInfo.userName}”) directly.  
3. **Dynamic Links:**  
   - If "${linkSection}" exists **and** message type is **"detailed email"** or **"short linkedin message"**, list links neatly in bullet points under “Links:” at the end of the message.  
   - For **"short whatsapp casual message"** or **"one liner message"**, omit formal links and instead integrate my LinkedIn or portfolio conversationally (if relevant).  
   - For **"one liner message"**, omit links completely.  
4. **Tone by Message Type:**  
   - **detailed email:** Warm, professional, slightly personal; structured with subject, greeting, body, and closing.  
   - **short whatsapp casual message:** Chill and friendly; emojis allowed if natural.  
   - **short linkedin message:** Brief, professional, approachable (under 5 sentences).  
   - **one liner message:** Quick, natural, under 150 characters; sounds human and spontaneous.

---

${linkSection ? `\n**My Links (for your reference):**\n${linkSection}` : ''}

Now generate the final outreach message following all rules exactly.
`;
    
    return prompt;
}
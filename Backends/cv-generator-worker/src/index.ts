// Path: CV-Genie-ai-POWERED-ats-friendly-CV-generator/index.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer from "@cloudflare/puppeteer";

export interface Env {
    MY_BROWSER: Fetcher;
}

const CORS_ORIGIN = "*"; // IMPORTANT: Update this to your Pages domain
const corsHeaders = {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// --- Type Definitions ---
type InlineData = {
    mimeType: string;
    data: string; // base64 encoded
};

// Payload for the FIRST request (/api/generate) - kept for compatibility if needed elsewhere
type GenerateRequestPayload = {
    geminiApiKey: string;
    geminiModel: string;
    targetJobTitle: string;
    profilePhoto: InlineData;
    linkedinData: string;
    personalDetails: {
        email?: string;
        phone?: string;
        location?: string;
        summary?: string;
        dateOfBirth?: string;    // ADDED
        placeOfBirth?: string;   // ADDED
        nationality?: string;    // ADDED
    };
    urls: {
        linkedinUrl?: string;
        githubUrl?: string;
        portfolioUrl?: string;
    }
};

// NEW: Payload for the SECOND request (/api/create-pdf)
type PdfRequestPayload = {
    curatedData: any; // The user-approved JSON
    profilePhoto: InlineData;
};


async function handleOptions(request: Request) {
    if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
    ) {
        return new Response(null, { headers: corsHeaders });
    } else {
        return new Response(null, { headers: { Allow: "POST, OPTIONS" } });
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        console.log(`DEBUG: Received request: ${request.method} ${request.url}`);

        if (request.method === "OPTIONS") {
            return handleOptions(request);
        }

        const url = new URL(request.url);

        // --- Step 1: Extract Data (/api/extract) ---
        if (request.method === "POST" && url.pathname === "/api/extract") {
            console.log("DEBUG: Matched route /api/extract.");
            try {
                if (request.headers.get("Content-Type") !== "application/json") {
                    console.error("DEBUG: Invalid Content-Type for /api/extract. Expected application/json.");
                    return new Response(JSON.stringify({ error: "Expected application/json" }), { status: 415, headers: corsHeaders });
                }

                console.log("DEBUG: Awaiting request JSON payload for /api/extract.");
                const payload = await request.json();
                console.log("DEBUG: Successfully parsed payload for /api/extract.");

                const { geminiApiKey, linkedinData } = payload;

                if (!geminiApiKey || !linkedinData) {
                    console.error("DEBUG: Missing required fields in /api/extract payload.");
                    return new Response(JSON.stringify({ error: "Missing required fields for extraction." }), { status: 400, headers: corsHeaders });
                }
                console.log("DEBUG: All required fields present for extraction.");

                console.log("DEBUG: Initializing GoogleGenerativeAI for extraction.");
                const genAI = new GoogleGenerativeAI(geminiApiKey);

                console.log("DEBUG: Getting extraction model (gemini-2.5-flash).");
                const extractionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                console.log("DEBUG: Calling extractData function.");
                const extractedJson = await extractData(linkedinData, extractionModel);
                console.log("DEBUG: Received extracted JSON from model.");

                const responseHeaders = new Headers(corsHeaders);
                responseHeaders.set("Content-Type", "application/json");

                console.log("DEBUG: Successfully processed /api/extract. Sending response.");
                return new Response(JSON.stringify(extractedJson), { headers: responseHeaders });

            } catch (error) {
                console.error("Error in /api/extract:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during extraction.";
                return new Response(JSON.stringify({ error: `Backend Error: ${errorMessage}` }), { status: 500, headers: corsHeaders });
            }
        }

        // --- Step 2: Curate Data (/api/curate) ---
        if (request.method === "POST" && url.pathname === "/api/curate") {
            console.log("DEBUG: Matched route /api/curate.");
            try {
                if (request.headers.get("Content-Type") !== "application/json") {
                    console.error("DEBUG: Invalid Content-Type for /api/curate. Expected application/json.");
                    return new Response(JSON.stringify({ error: "Expected application/json" }), { status: 415, headers: corsHeaders });
                }

                console.log("DEBUG: Awaiting request JSON payload for /api/curate.");
                const payload = await request.json();
                console.log("DEBUG: Successfully parsed payload for /api/curate.");

                const { geminiApiKey, geminiModel, extractedJson, targetJobTitle, personalDetails, urls, jobInfo, companyInfo } = payload;

                if (!geminiApiKey || !geminiModel || !extractedJson || !targetJobTitle) {
                    console.error("DEBUG: Missing required fields in /api/curate payload.");
                    return new Response(JSON.stringify({ error: "Missing required fields for curation." }), { status: 400, headers: corsHeaders });
                }
                console.log("DEBUG: All required fields present for curation.");

                console.log("DEBUG: Initializing GoogleGenerativeAI for curation.");
                const genAI = new GoogleGenerativeAI(geminiApiKey);

                console.log(`DEBUG: Getting curation model (${geminiModel}).`);
                const curationModel = genAI.getGenerativeModel({ model: geminiModel });

                console.log("DEBUG: Merging personal details into extracted JSON before curation.{geminiModel}");
                if (personalDetails) {
                    if (!extractedJson.contactInfo) extractedJson.contactInfo = {};
                    if (personalDetails.email) extractedJson.contactInfo.email = personalDetails.email;
                    if (personalDetails.phone) extractedJson.contactInfo.phone = personalDetails.phone;
                    if (personalDetails.location) extractedJson.contactInfo.location = personalDetails.location;
                    extractedJson.personalDetails = personalDetails;
                }

                console.log("DEBUG: Calling curateData function.");
                const curatedJson = await curateData(extractedJson, targetJobTitle, personalDetails?.summary, jobInfo, companyInfo, curationModel);

                console.log("DEBUG: Merging URL details into curated JSON.");
                if (curatedJson.contactInfo) {
                    if (urls?.linkedinUrl) curatedJson.contactInfo.linkedin = urls.linkedinUrl;
                    if (urls?.githubUrl) curatedJson.contactInfo.github = urls.githubUrl;
                    if (urls?.portfolioUrl) curatedJson.contactInfo.portfolio = urls.portfolioUrl;
                }
                console.log("DEBUG: URL details merged.");

                const responseHeaders = new Headers(corsHeaders);
                responseHeaders.set("Content-Type", "application/json");

                console.log("DEBUG: Successfully processed /api/curate. Sending response.");
                return new Response(JSON.stringify(curatedJson), { headers: responseHeaders });

            } catch (error) {
                console.error("Error in /api/curate:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during curation.";
                return new Response(JSON.stringify({ error: `Backend Error: ${errorMessage}` }), { status: 500, headers: corsHeaders });
            }
        }

        // --- NEW: Endpoint 2: Generate PDF from Curated Data (unchanged) ---
        if (request.method === "POST" && url.pathname === "/api/create-pdf") {
            console.log("DEBUG: Matched route /api/create-pdf.");
            try {
                if (request.headers.get("Content-Type") !== "application/json") {
                    console.error("DEBUG: Invalid Content-Type for /api/create-pdf. Expected application/json.");
                    return new Response(JSON.stringify({ error: "Expected application/json" }), { status: 415, headers: corsHeaders });
                }

                console.log("DEBUG: Awaiting request JSON payload for /api/create-pdf.");
                const payload = await request.json<PdfRequestPayload>();
                console.log("DEBUG: Successfully parsed payload for /api/create-pdf.");
                const { curatedData, profilePhoto } = payload;

                if (!curatedData || !profilePhoto) {
                    console.error("DEBUG: Missing curated data or photo in /api/create-pdf payload.");
                    return new Response(JSON.stringify({ error: "Missing curated data or photo for PDF generation." }), { status: 400, headers: corsHeaders });
                }
                console.log("DEBUG: Curated data and photo present.");

                console.log("DEBUG: Calling generatePdf function.");
                const pdf = await generatePdf(curatedData, profilePhoto, env.MY_BROWSER);
                console.log(`DEBUG: PDF generated successfully. Size: ${pdf.byteLength} bytes.`);

                const responseHeaders = new Headers(corsHeaders);
                responseHeaders.set("Content-Type", "application/pdf");
                responseHeaders.set("Content-Disposition", 'attachment; filename="CV_Genie_Final.pdf"');

                console.log("DEBUG: Successfully processed /api/create-pdf. Sending PDF response.");
                return new Response(pdf, { headers: responseHeaders });

            } catch (error) {
                console.error("Error in /api/create-pdf:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during PDF creation.";
                return new Response(JSON.stringify({ error: `Backend Error: ${errorMessage}` }), { status: 500, headers: corsHeaders });
            }
        }

        console.log(`DEBUG: No matching route found for ${request.method} ${url.pathname}.`);
        return new Response("Not Found", { status: 404 });
    },
};

async function extractData(text: string, model: any): Promise<any> {
    console.log("DEBUG: [extractData] Starting data extraction.");
    const prompt = `
    You are a precise CV parsing agent.
    Analyze the unstructured text and convert it into a structured JSON object. Adhere strictly to the JSON schema.
    If information is missing, omit the key. Plus don't change the content just parse it into clean json.

    CRITICAL: Escape special characters like double quotes (") with a backslash (\\") to ensure valid JSON output.
    CRITICAL: Format all the dates to a consistent MM/YYYY or DD/MM/YYYY e.g. Change August 2025 to 08/2025 or 3rd September 2024 to 03/09/2025. 

    JSON Schema:
    - name: string
    - title: string
    - contactInfo: { email: string, phone: string, location: string }
    - summary: string
    - workExperience: [{ title: string, company: string, location: string, dates: string, description: string[] }]
    - education: [{ institution: string, degree: string, dates: string }]
    - skills: string[]
    - projects: [{ name: string, description: string, url?: string }]
    - certifications: [{ name: string, issuer: string, date: string }]

    Provide ONLY the clean JSON object.
    Text:
    ---
    ${text}
    ---
    `;
    console.log("DEBUG: [extractData] Sending prompt to Gemini model.");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("DEBUG: [extractData] Received raw text response from model.");
    
    console.log("DEBUG: [extractData] Parsing JSON text.");
    const parsedJson = JSON.parse(jsonText);
    console.log("DEBUG: [extractData] Successfully parsed JSON. Extraction complete.");
    return parsedJson;
}

async function curateData(fullJson: any, targetJobTitle: string, userSummary: string | undefined, jobInfo: string | undefined, companyInfo: string | undefined, model: any): Promise<any> {
    console.log(`DEBUG: [curateData] Starting data curation for target job: "${targetJobTitle}".`);
    const prompt = `
    You are an expert career storyteller and CV editor specializing in European, particularly German, job markets.
    Your task is to transform a comprehensive JSON data object into a highly focused, concise, and impactful CV tailored for the role of "${targetJobTitle}".
    Your guiding principles are relevance, brevity, and cultural adaptation.

    Follow these rules meticulously:

    1.  **Filter All Sections**: Review every section (workExperience, projects, certifications, education, skills).
        Retain ONLY the items that are demonstrably relevant to a "${targetJobTitle}".
        If a section (e.g., certifications) contains no relevant items, omit the entire section from the final output.

    2.  **Rewrite and Quantify Achievements**: You must rewrite, not just copy. Your goal is to create a compelling narrative.
        * **Work Experience**: For each relevant job, distill the description into a maximum of "two" powerful bullet points. Each bullet must showcase an achievement. **Where possible, invent a realistic, impressive metric (e.g., 'improved efficiency by 30%', 'managed a portfolio of 5 projects') to make the achievement more concrete.**
        * **Projects**: For each relevant project, write a "single sentence (1-2 lines max)" describing its outcome and the key skill demonstrated. Choose a maximum of 4-6 of the most relevant Projects.
        * **Certifications**: Choose a maximum of 4-6 of the most relevant certifications.

    3.  **Categorize Skills with Language Proficiency**: Analyze all skills. Organize the most relevant ones into logical categories.
        **Crucially, identify any languages mentioned and place them in a dedicated "Languages" category, estimating the proficiency level (e.g., "English (Fluent)", "German (Beginner)")**.
        The output for the 'skills' key MUST be an object.

    4.  **Craft the Professional Summary**: If a user-provided summary exists, refine it to be a powerful 2-3 sentence pitch. If not, create a new summary from scratch.

    5.  **Format Personal Data (Sehr Wichtig/Very Important!)**: If personal details like "dateOfBirth", "placeOfBirth", or "nationality" are present in the input JSON's 'personalDetails' object, create a new top-level key in the output called \`personalData\`. Place these details there. Do not place them under \`contactInfo\`.
        Example: \`"personalData": { "dateOfBirth": "21/05/1995", "placeOfBirth": "Taxila, Pakistan", "nationality": "Pakistani" }\`

    6.  **Final Output**: Return ONLY a valid JSON object with the refined content. The schema must be the same as the input, but with the potential addition of the 'personalData' object and with the 'skills' key being an object of string arrays.


    ${(jobInfo || companyInfo) ? `---
    ADDITIONAL CONTEXT (Use this to improve relevance):
    ${jobInfo ? `Job Description: ${jobInfo}` : ''}
    ${companyInfo ? `Company Information: ${companyInfo}` : ''}
    ---` : ''}

    User-Provided Summary (use as a base if available):
    ---
    ${userSummary || "Not provided."}
    ---

    Full JSON data to filter, rewrite, and summarize:
    ---
    ${JSON.stringify(fullJson, null, 2)}
    ---
    `;
    console.log("DEBUG: [curateData] Sending prompt to Gemini model.");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("DEBUG: [curateData] Parsing JSON text.");
    const parsedJson = JSON.parse(jsonText);
    console.log("DEBUG: [curateData] Successfully parsed JSON. Curation complete.");
    return parsedJson;
}

async function generatePdf(data: any, photo: InlineData, browserBinding: Fetcher): Promise<ArrayBuffer> {
    console.log("DEBUG: [generatePdf] Starting PDF generation.");

    const photoDataUrl = `data:${photo.mimeType};base64,${photo.data}`;
    const html = generateCvHtml(data, photoDataUrl);

    // --- TEMPLATES ---
    // An empty but robustly styled header to override the default.
    const headerTemplate = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                </body>
        </html>
    `;

    // A robust footer template using flexbox for reliable centering.
    const footerTemplate = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                        box-sizing: border-box;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        height: 100%;
                        font-size: 9pt;
                        font-family: Calibri, Arial, sans-serif;
                        color: #555;
                        margin: 0;
                        padding: 0 10mm; /* Corresponds to page left/right margin */
                    }
                    .signature {
                        font-family: 'Brush Script MT', cursive; /* A common script font */
                    }
                </style>
            </head>
            <body>
                <span>${data.contactInfo.location || 'City'}, ${new Date().toLocaleDateString('en-GB')}</span>
                <span class="signature">, ${data.name || ""}</span>
            </body>
        </html>
    `;

    let browser = null;
    try {
        browser = await puppeteer.launch(browserBinding);
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            
            // --- PDF OPTIONS ---
            displayHeaderFooter: true,
            headerTemplate: headerTemplate,
            footerTemplate: footerTemplate,
            
            // Defines the space for the header/footer and side gutters.
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '10mm',
                right: '10mm',
            },
        });

        console.log("DEBUG: [generatePdf] PDF buffer created successfully.");
        return pdfBuffer;
    } finally {
        if (browser) {
            await browser.close();
            console.log("DEBUG: [generatePdf] Browser instance closed.");
        }
    }
}

function generateCvHtml(data: any, photoDataUrl: string): string {
    console.log("DEBUG: [generateCvHtml] Starting HTML generation.");

    const { name, title, contactInfo, personalData, summary, workExperience, education, skills, projects, certifications } = data;

    const renderList = (items: string[]) => items ? `<ul class="job-description">${items.map(item => `<li>${item}</li>`).join('')}</ul>` : '';
    
    const renderCategorizedSkills = (skillsObject: { [key: string]: string[] }) => {
        if (!skillsObject || Object.keys(skillsObject).length === 0) return '';
        return Object.entries(skillsObject)
            .map(([category, items]) => `
                <div class="skill-category">
                    <h4>${category}</h4>
                    <p>${items.join(' • ')}</p>
                </div>
            `).join('');
    };

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${name ? `CV - ${name}` : 'Curriculum Vitae'}</title>
        <style>
            /* 1. Set the @page margin to the BORDER'S desired position */
            @page {
                size: A4;
                margin: 10mm; /* e.g., Border will be 10mm from the paper edge */
            }

            /* 2. Global reset for predictable box model behavior */
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                font-family: Calibri, Arial, Helvetica, sans-serif;
                font-size: 11pt;
                color: #333;
                line-height: 1.25;
                counter-reset: page;
            }

            /* 3. Draw the border to fill the space defined by @page margin */
            body::before {
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 1px solid #003399;
                pointer-events: none;
            }

            /* 4. Add PADDING to the main container to space content from the border */
            .cv-container {
                padding-top: 5mm;
                padding-bottom: 5mm;
                padding-left: 5mm;
                padding-right: 5mm; /* This is the space between the border and your text */
            }

            /* --- All your other styles for content remain the same --- */

            .cv-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid #003399;
                padding-bottom: 5px;
                margin-bottom: 10px;
            }

            .header-text h1 {
                font-size: 20pt;
                color: #003399;
                font-weight: 700;
            }

            .header-text h2 {
                font-size: 12pt;
                color: #333;
                font-weight: normal;
            }
            
            .contact-line {
                font-size: 10pt;
                color: #444;
                margin-top: 6px;
            }

            .contact-line a {
                color: #003399;
                text-decoration: none;
            }
            .contact-line a:hover { text-decoration: underline; }

            .profile-photo {
                width: 85px;
                height: 85px;
                border-radius: 50%;
                object-fit: cover;
                margin-left: 15px;
            }

            section {
                margin-bottom: 8px; /* Added a bit more space between sections */
            }

            section h2 {
                font-size: 13pt;
                color: #003399;
                border-bottom: 1px solid #003399;
                margin-bottom: 6px; /* Added a bit more space */
                font-weight: 600;
                padding-bottom: 2px;
            }

            article {
                margin-bottom: 4px; /* Added a bit more space */
            }

            .entry-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
            }

            .entry-header h3 {
                font-size: 11.5pt;
                color: #111;
                font-weight: bold;
            }

            .entry-header .dates {
                font-size: 10pt;
                color: #666;
                font-style: italic;
            }

            .sub-header {
                font-size: 10.5pt;
                color: #444;
                margin: 2px 0 4px 0;
            }

            .job-description {
                padding-left: 18px;
            }

            .job-description li {
                margin-bottom: 2px;
            }
            
            .skills-section {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .skill-category h4 {
                font-size: 10.5pt;
                color: #003399;
                margin-bottom: 2px;
            }

            .skill-category p {
                font-size: 10.5pt;
                color: #333;
            }
        </style>
    </head>
    <body>
        <main class="cv-container">
            <section class="cv-header">
                <div class="header-text">
                    ${name ? `<h1>${name}</h1>` : ''}
                    ${title ? `<h2>${title}</h2>` : ''}
                    
                    <div class="contact-line">
                        ${contactInfo?.location ? `<span>${contactInfo.location}</span>` : ''}
                        ${contactInfo?.phone ? ` • <span>${contactInfo.phone}</span>` : ''}
                        ${personalData?.dateOfBirth ? ` • <span>Born: ${personalData.dateOfBirth}</span>` : ''}
                        ${personalData?.nationality ? ` • <span>Nationality: ${personalData.nationality}</span>` : ''}
                    </div>

                    <div class="contact-line">
                        ${contactInfo?.email ? `<a href="mailto:${contactInfo.email}">${contactInfo.email}</a>` : ''}
                        ${contactInfo?.linkedin ? ` • <a href="${contactInfo.linkedin}" target="_blank">LinkedIn</a>` : ''}
                        ${contactInfo?.github ? ` • <a href="${contactInfo.github}" target="_blank">GitHub</a>` : ''}
                        ${contactInfo?.portfolio ? ` • <a href="${contactInfo.portfolio}" target="_blank">Portfolio</a>` : ''}
                    </div>
                </div>
                ${photoDataUrl ? `<img src="${photoDataUrl}" alt="Profile photo of ${name}" class="profile-photo">` : ''}
            </section>     

            ${summary ? `<section><p>${summary}</p></section>` : ''}

            ${skills && Object.keys(skills).length ? `<section><h2>Skills</h2><div class="skills-section">${renderCategorizedSkills(skills)}</div></section>` : ''}

            ${workExperience && workExperience.length ? `<section><h2>Work Experience</h2>${workExperience.map(job => `<article><div class="entry-header"><h3>${job.title}</h3><span class="dates">${job.dates || ''}</span></div><p class="sub-header">${job.company || ''}${job.location ? ` — ${job.location}` : ''}</p>${job.description ? renderList(job.description) : ''}</article>`).join('')}</section>` : ''}

            ${education && education.length ? `<section><h2>Education</h2>${education.map(edu => `<article><div class="entry-header"><h3>${edu.institution}</h3><span class="dates">${edu.dates || ''}</span></div><p class="sub-header">${edu.degree || ''}</p></article>`).join('')}</section>` : ''}

            ${certifications && certifications.length ? `<section><h2>Certifications</h2>${certifications.map(cert => `<article><p class="sub-header"><strong>${cert.name}</strong> — ${cert.issuer || ''} ${cert.date ? `(${cert.date})` : ''}</p></article>`).join('')}</section>` : ''}

            ${projects && projects.length ? `<section><h2>Projects</h2>${projects.map(proj => `<article><div class="entry-header"><h3>${proj.name}</h3></div><p class="sub-header">${proj.description || ''} ${proj.url ? `(<a href="${proj.url}" target="_blank">Link</a>)` : ''}</p></article>`).join('')}</section>` : ''}
        </main>
    </body>
    </html>`;

    console.log("DEBUG: [generateCvHtml] HTML generated successfully.");
    return html;
}

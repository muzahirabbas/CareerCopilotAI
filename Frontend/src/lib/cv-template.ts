
import { CuratedCVData } from "./types";

export function generateCvHtml(data: CuratedCVData, photoDataUrl: string): string {
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
    const currentYear = new Date().getFullYear();
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${name ? `CV - ${name}` : 'Curriculum Vitae'}</title>
        <style>
            @page {
                size: A4;
                margin: 10mm;
             @bottom-center {
                    content: "© ${currentYear} ${name || ''} — Page " counter(page);
                    font-size: 9pt;
                    font-family: Calibri, Arial, sans-serif;
                    color: #555;
                }
            }

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

            .cv-container {
                padding-top: 5mm;
                padding-bottom: 5mm;
                padding-left: 5mm;
                padding-right: 5mm;
            }

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
                margin-bottom: 8px;
            }

            section h2 {
                font-size: 13pt;
                color: #003399;
                border-bottom: 1px solid #003399;
                margin-bottom: 6px;
                font-weight: 600;
                padding-bottom: 2px;
            }

            article {
                margin-bottom: 4px;
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
            <header class="cv-header">
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
            </header>     

            ${summary ? `<section><p>${summary}</p></section>` : ''}

            ${education && education.length ? `<section><h2>Education</h2>${education.map(edu => `<article><div class="entry-header"><h3>${edu.institution}</h3><span class="dates">${edu.dates || ''}</span></div><p class="sub-header">${edu.degree || ''}</p></article>`).join('')}</section>` : ''}

            ${workExperience && workExperience.length ? `<section><h2>Work Experience</h2>${workExperience.map(job => `<article><div class="entry-header"><h3>${job.title}</h3><span class="dates">${job.dates || ''}</span></div><p class="sub-header">${job.company || ''}${job.location ? ` — ${job.location}` : ''}</p>${job.description ? renderList(job.description) : ''}</article>`).join('')}</section>` : ''}

            ${certifications && certifications.length ? `<section><h2>Certifications</h2>${certifications.map(cert => `<article><p class="sub-header"><strong>${cert.name}</strong> — ${cert.issuer || ''} ${cert.date ? `(${cert.date})` : ''}</p></article>`).join('')}</section>` : ''}

            ${projects && projects.length ? `<section><h2>Projects</h2>${projects.map(proj => `<article><div class="entry-header"><h3>${proj.name}</h3></div><p class="sub-header">${proj.description || ''} ${proj.url ? `(<a href="${proj.url}" target="_blank">Link</a>)` : ''}</p></article>`).join('')}</section>` : ''}

            ${skills && Object.keys(skills).length ? `<section><h2>Skills</h2><div class="skills-section">${renderCategorizedSkills(skills)}</div></section>` : ''}
        </main>
    </body>
    </html>`;
}

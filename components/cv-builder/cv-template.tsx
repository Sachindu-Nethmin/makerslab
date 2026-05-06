"use client";

import React from "react";

interface CVTemplateProps {
  cvInfo: any;
  projects: any[];
  education?: any;
  leadership?: any[];
  certificates?: any[];
}

export function CVTemplate({ cvInfo, projects, education, leadership = [], certificates = [] }: CVTemplateProps) {
  const skills = cvInfo.skills.split(",").map((s: string) => s.trim()).filter(Boolean);

  // Group certificates by category
  const certificatesByCategory = certificates.reduce((acc: any, cert: any) => {
    if (!acc[cert.category]) {
      acc[cert.category] = [];
    }
    acc[cert.category].push(cert);
    return acc;
  }, {});

  return (
    <div id="cv-printable-area" className="w-full bg-white text-[#1a1a1a] font-serif leading-relaxed">
      {/* Header */}
      <header className="border-b-2 border-black pb-6 mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">{cvInfo.name}</h1>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-sans mb-4">
          {cvInfo.phone && <div>{cvInfo.phone}</div>}
          {cvInfo.address && <div>⋄ {cvInfo.address}</div>}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-sans">
          {cvInfo.email && <div>{cvInfo.email}</div>}
          {cvInfo.linkedin && (
            <div>
              ⋄ <a href={cvInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Linkedin
              </a>
            </div>
          )}
          {cvInfo.github && (
            <div>
              ⋄ <a href={cvInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                GitHub
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {cvInfo.summary && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 font-sans tracking-wider">Summary</h2>
          <p className="text-[14px] text-gray-800 leading-relaxed">{cvInfo.summary}</p>
        </section>
      )}

      {/* Education */}
      {education && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 font-sans tracking-wider">Education</h2>

          <div className="mb-6">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-md">{education.degree}</h3>
              <span className="text-[12px] text-gray-600">{education.year}</span>
            </div>
            <p className="text-sm text-gray-700">{education.institution}</p>
            {education.coursework && (
              <p className="text-[13px] text-gray-800 mt-2">
                <span className="font-semibold">Relevant Coursework:</span> {education.coursework}
              </p>
            )}
          </div>

          {education.highSchool && (
            <div>
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-md">{education.highSchool}</h3>
                <span className="text-[12px] text-gray-600">{education.highSchoolYear}</span>
              </div>
              <p className="text-sm text-gray-700">Advanced Level: Mathematics, Physics, Chemistry</p>
            </div>
          )}
        </section>
      )}

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 font-sans tracking-wider">Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string) => (
              <span key={skill} className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 font-sans">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 font-sans tracking-wider">Projects</h2>
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project._id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-md font-bold font-sans">{project.title}</h4>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[10px]">
                      GitHub
                    </a>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 italic font-sans">
                  {project.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {project.startDate && " - "}
                  {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (project.status === 'in-progress' ? 'Present' : '')}
                </span>
                <p className="text-[11px] font-sans text-gray-700 mb-2 uppercase tracking-widest font-semibold">{project.category}</p>
                <p className="text-[13px] text-gray-800 mb-3 leading-snug">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="text-[9px] font-mono bg-gray-50 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leadership & Activities */}
      {leadership.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 font-sans tracking-wider">Leadership & Activities</h2>
          <ul className="space-y-2">
            {leadership.map((item, index) => (
              <li key={index} className="text-[13px] text-gray-800 flex">
                <span className="mr-2">•</span>
                <span>{item.title}{item.description && ` - ${item.description}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Awards & Certificates */}
      {certificates.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 font-sans tracking-wider">Awards & Certificates</h2>
          {Object.entries(certificatesByCategory).map(([category, certs]: [string, any]) => (
            <div key={category} className="mb-4">
              <h3 className="font-bold text-md mb-2">{category}</h3>
              <ul className="space-y-1">
                {certs.map((cert: any, index: number) => (
                  <li key={index} className="text-[12px] text-gray-800 flex justify-between">
                    <span>
                      • {cert.name} ({cert.issuer})
                    </span>
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Link
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}


      <style dangerouslySetInnerHTML={{ __html: `
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        @media print {
          @page {
            margin: 0;
            size: A4;
            padding: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          nav, header:not(#cv-printable-area header), footer, button, .no-print {
            display: none !important;
          }
          #cv-printable-area {
            display: block !important;
            margin: 0 !important;
            padding: 20mm !important;
            border: none !important;
            width: 100% !important;
            max-width: none !important;
            background: white !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .min-h-screen, .bg-background {
            background: white !important;
            min-height: auto !important;
            padding: 0 !important;
          }
          .max-w-7xl {
            max-width: none !important;
          }
          section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      ` }} />
    </div>
  );
}

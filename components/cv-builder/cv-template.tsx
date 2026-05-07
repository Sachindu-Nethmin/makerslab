"use client";

import React from "react";
import { CVInfo, Education, Leadership, Certificate, CVProject } from "./types";

const SANS_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const SERIF_FONT = "Georgia, 'Times New Roman', Times, serif";
const MONO_FONT = "ui-monospace, 'Courier New', monospace";

interface CVTemplateProps {
  cvInfo: CVInfo;
  projects: CVProject[];
  education?: Education;
  leadership?: Leadership[];
  certificates?: Certificate[];
}

export function CVTemplate({ cvInfo, projects, education, leadership = [], certificates = [] }: CVTemplateProps) {
  const skills = typeof cvInfo?.skills === "string"
    ? cvInfo.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Group certificates by category
  const certificatesByCategory = certificates.reduce((acc: Record<string, Certificate[]>, cert: Certificate) => {
    if (!acc[cert.category]) {
      acc[cert.category] = [];
    }
    acc[cert.category].push(cert);
    return acc;
  }, {});

  const contactLine1 = [cvInfo.phone, cvInfo.address].filter(Boolean);
  const contactLine2 = [
    cvInfo.email,
    cvInfo.linkedin ? { label: "LinkedIn", url: cvInfo.linkedin } : null,
    cvInfo.github ? { label: "GitHub", url: cvInfo.github } : null
  ].filter(Boolean);

  return (
    <div id="cv-printable-area" style={{ background: 'white', color: '#1a1a1a', fontFamily: SERIF_FONT, lineHeight: 1.625 }}>
      {/* Header */}
      <header style={{ borderBottom: '2px solid black', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>{cvInfo.name}</h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '1.5rem', rowGap: '0.5rem', fontSize: '0.875rem', fontFamily: SANS_FONT, marginBottom: '1rem' }}>
          {contactLine1.map((item, idx) => (
            <div key={idx}>
              {idx > 0 && <span style={{ marginRight: '0.5rem' }}>⋄</span>}
              {item}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '1.5rem', rowGap: '0.5rem', fontSize: '0.875rem', fontFamily: SANS_FONT }}>
          {contactLine2.map((item, idx) => (
            <div key={idx}>
              {idx > 0 && <span style={{ marginRight: '0.5rem' }}>⋄</span>}
              {typeof item === "string" ? (
                item
              ) : (
                <a href={item?.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                  {item?.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Summary */}
      {cvInfo.summary && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', marginBottom: '0.75rem', fontFamily: SANS_FONT, letterSpacing: '0.05em' }}>Summary</h2>
          <p style={{ fontSize: 14, color: '#1f2937', lineHeight: 1.625 }}>{cvInfo.summary}</p>
        </section>
      )}

      {/* Education */}
      {education && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', marginBottom: '0.75rem', fontFamily: SANS_FONT, letterSpacing: '0.05em' }}>Education</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{education.degree}</h3>
              <span style={{ fontSize: 12, color: '#4b5563' }}>{education.year}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#374151' }}>{education.institution}</p>
            {education.coursework && (
              <p style={{ fontSize: 13, color: '#1f2937', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Relevant Coursework:</span> {education.coursework}
              </p>
            )}
          </div>

          {education.highSchool && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{education.highSchool}</h3>
                <span style={{ fontSize: 12, color: '#4b5563' }}>{education.highSchoolYear}</span>
              </div>
              {education.highSchoolStream && (
                <p style={{ fontSize: '0.875rem', color: '#374151' }}>Advanced Level: {education.highSchoolStream}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', marginBottom: '0.75rem', fontFamily: SANS_FONT, letterSpacing: '0.05em' }}>Technical Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.map((skill: string) => (
              <span key={skill} style={{ fontSize: '0.75rem', background: '#f9fafb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb', fontFamily: SANS_FONT }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', marginBottom: '1rem', fontFamily: SANS_FONT, letterSpacing: '0.05em' }}>Projects</h2>
          <div>
            {projects.map((project, index) => (
              <div key={project._id} style={{ breakInside: 'avoid', marginTop: index === 0 ? 0 : '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: SANS_FONT }}>{project.title}</h4>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: 10 }}>
                      GitHub
                    </a>
                  )}
                </div>
                <span style={{ fontSize: 10, color: '#6b7280', fontStyle: 'italic', fontFamily: SANS_FONT }}>
                  {project.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {project.startDate && " - "}
                  {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (project.status === 'in-progress' ? 'Present' : '')}
                </span>
                <p style={{ fontSize: 11, fontFamily: SANS_FONT, color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{project.category}</p>
                <p style={{ fontSize: 13, color: '#1f2937', marginBottom: '0.75rem', lineHeight: 1.375 }}>{project.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {project.tags.map((tag: string) => (
                    <span key={tag} style={{ fontSize: 9, fontFamily: MONO_FONT, background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', textTransform: 'uppercase' }}>
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
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', marginBottom: '0.75rem', fontFamily: SANS_FONT, letterSpacing: '0.05em' }}>Leadership & Activities</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {leadership.map((item, index) => (
              <li key={index} style={{ fontSize: 13, color: '#1f2937', display: 'flex', marginTop: index === 0 ? 0 : '0.5rem' }}>
                <span style={{ marginRight: '0.5rem' }}>•</span>
                <span>{item.title}{item.description && ` - ${item.description}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Awards & Certificates */}
      {certificates.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', marginBottom: '0.75rem', fontFamily: SANS_FONT, letterSpacing: '0.05em' }}>Awards & Certificates</h2>
          {Object.entries(certificatesByCategory).map(([category, certs]: [string, Certificate[]]) => (
            <div key={category} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>{category}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {certs.map((cert: Certificate, index: number) => (
                  <li key={index} style={{ fontSize: 12, color: '#1f2937', display: 'flex', justifyContent: 'space-between', marginTop: index === 0 ? 0 : '0.25rem' }}>
                    <span>
                      • {cert.name} ({cert.issuer})
                    </span>
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
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
    </div>
  );
}

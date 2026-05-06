"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus } from "lucide-react";
import { CVPreview } from "./cv-preview";
import { CVInfo, Education, Leadership, Certificate, CVProject } from "./types";

interface BuilderFormProps {
  user: any;
  projects: CVProject[];
}

export function BuilderForm({ user, projects }: BuilderFormProps) {
  // Initialize state from localStorage or defaults
  const STORAGE_KEY = `userCV:${user._id}`;

  const [cvInfo, setCvInfo] = useState<CVInfo>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.cvInfo) return parsed.cvInfo;
        }
      } catch (e) {
        console.error("Failed to load CV info from localStorage", e);
      }
    }
    return {
      name: user.name || "",
      title: "",
      email: user.email || "",
      phone: "",
      address: "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      summary: user.bio || "",
      skills: Array.from(new Set(projects.flatMap(p => p.tags))).join(", "),
    };
  });

  const [education, setEducation] = useState<Education>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.education) return parsed.education;
        }
      } catch (e) {
        console.error("Failed to load education from localStorage", e);
      }
    }
    return {
      degree: "",
      institution: "",
      year: "",
      coursework: "",
      highSchool: "",
      highSchoolYear: "",
      highSchoolStream: "",
    };
  });

  const [leadership, setLeadership] = useState<Leadership[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.leadership) return parsed.leadership;
        }
      } catch (e) {
        console.error("Failed to load leadership from localStorage", e);
      }
    }
    return [];
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.certificates) return parsed.certificates;
        }
      } catch (e) {
        console.error("Failed to load certificates from localStorage", e);
      }
    }
    return [];
  });

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedProjectIds) return parsed.selectedProjectIds;
        }
      } catch (e) {
        console.error("Failed to load selected projects from localStorage", e);
      }
    }
    return projects.slice(0, 3).map(p => p._id);
  });

  const [newLeadership, setNewLeadership] = useState<Leadership>({
    title: "",
    description: "",
  });

  const [newCertificate, setNewCertificate] = useState<Certificate>({
    name: "",
    category: "",
    issuer: "",
    link: "",
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cvInfo,
        education,
        leadership,
        certificates,
        selectedProjectIds
      }));
    } catch (e) {
      console.error("Failed to save CV data to localStorage", e);
    }
  }, [cvInfo, education, leadership, certificates, selectedProjectIds, STORAGE_KEY]);

  const handleCvInfoChange = (field: keyof CVInfo, value: string) => {
    setCvInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (field: keyof Education, value: string) => {
    setEducation(prev => ({ ...prev, [field]: value }));
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const addLeadership = () => {
    if (newLeadership.title.trim()) {
      setLeadership(prev => [...prev, newLeadership]);
      setNewLeadership({ title: "", description: "" });
    }
  };

  const removeLeadership = (index: number) => {
    setLeadership(prev => prev.filter((_, i) => i !== index));
  };

  const addCertificate = () => {
    if (newCertificate.name.trim() && newCertificate.category.trim()) {
      setCertificates(prev => [...prev, newCertificate]);
      setNewCertificate({ name: "", category: "", issuer: "", link: "" });
    }
  };

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const selectedProjects = projects.filter(p => selectedProjectIds.includes(p._id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
      <div className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Basic Info</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* BASIC INFO TAB */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Enter your contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={cvInfo.name}
                      onChange={(e) => handleCvInfoChange("name", e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Professional Title</Label>
                    <Input
                      value={cvInfo.title}
                      onChange={(e) => handleCvInfoChange("title", e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={cvInfo.address}
                    onChange={(e) => handleCvInfoChange("address", e.target.value)}
                    placeholder="City, Street, Country"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={cvInfo.email}
                      onChange={(e) => handleCvInfoChange("email", e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={cvInfo.phone}
                      onChange={(e) => handleCvInfoChange("phone", e.target.value)}
                      placeholder="+94 7X XXX XXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={cvInfo.linkedin}
                      onChange={(e) => handleCvInfoChange("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input
                      value={cvInfo.github}
                      onChange={(e) => handleCvInfoChange("github", e.target.value)}
                      placeholder="github.com/username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Professional Summary</Label>
                  <Textarea
                    value={cvInfo.summary}
                    onChange={(e) => handleCvInfoChange("summary", e.target.value)}
                    placeholder="Describe your background..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Technical Skills (comma separated)</Label>
                  <Textarea
                    value={cvInfo.skills}
                    onChange={(e) => handleCvInfoChange("skills", e.target.value)}
                    placeholder="Python, React, Next.js, TypeScript..."
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Select Projects to Include</h3>
                  <div className="space-y-2">
                    {projects.map(project => (
                      <label key={project._id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProjectIds.includes(project._id)}
                          onChange={() => toggleProject(project._id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{project.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EDUCATION TAB */}
          <TabsContent value="education" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    value={education.degree}
                    onChange={(e) => handleEducationChange("degree", e.target.value)}
                    placeholder="BSc (Hons) in Computer Science"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Input
                      value={education.institution}
                      onChange={(e) => handleEducationChange("institution", e.target.value)}
                      placeholder="University Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      value={education.year}
                      onChange={(e) => handleEducationChange("year", e.target.value)}
                      placeholder="2022 – 2026"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Relevant Coursework</Label>
                  <Textarea
                    value={education.coursework}
                    onChange={(e) => handleEducationChange("coursework", e.target.value)}
                    placeholder="OOP, Data Structures, Database Management..."
                    rows={3}
                  />
                </div>

                <hr className="my-4" />

                <div className="space-y-2">
                  <Label>High School</Label>
                  <Input
                    value={education.highSchool}
                    onChange={(e) => handleEducationChange("highSchool", e.target.value)}
                    placeholder="High School Name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>High School Year</Label>
                    <Input
                      value={education.highSchoolYear}
                      onChange={(e) => handleEducationChange("highSchoolYear", e.target.value)}
                      placeholder="2019-2021"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stream</Label>
                    <Input
                      value={education.highSchoolStream || ""}
                      onChange={(e) => handleEducationChange("highSchoolStream", e.target.value)}
                      placeholder="Physical Science, Commerce..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leadership & Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Activity/Role</Label>
                  <Input
                    value={newLeadership.title}
                    onChange={(e) => setNewLeadership({...newLeadership, title: e.target.value})}
                    placeholder="Vice Chairperson, IEEE Computer Society"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={newLeadership.description}
                    onChange={(e) => setNewLeadership({...newLeadership, description: e.target.value})}
                    rows={2}
                  />
                </div>

                <Button onClick={addLeadership} variant="outline" className="w-full" type="button">
                  <Plus className="w-4 h-4 mr-2" /> Add Activity
                </Button>

                <div className="space-y-2">
                  {leadership.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-accent rounded">
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </div>
                      <button onClick={() => removeLeadership(idx)} type="button">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CERTIFICATES TAB */}
          <TabsContent value="certificates" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Awards & Certificates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Certificate Name</Label>
                  <Input
                    value={newCertificate.name}
                    onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                    placeholder="WSO2 Certified Ballerina Developer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newCertificate.category}
                      onChange={(e) => setNewCertificate({...newCertificate, category: e.target.value})}
                      placeholder="Ballerina, Game Development..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuer</Label>
                    <Input
                      value={newCertificate.issuer}
                      onChange={(e) => setNewCertificate({...newCertificate, issuer: e.target.value})}
                      placeholder="WSO2, Microsoft..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certificate Link</Label>
                  <Input
                    value={newCertificate.link}
                    onChange={(e) => setNewCertificate({...newCertificate, link: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <Button onClick={addCertificate} variant="outline" className="w-full" type="button">
                  <Plus className="w-4 h-4 mr-2" /> Add Certificate
                </Button>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-accent rounded">
                      <div>
                        <p className="font-semibold text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.category} • {cert.issuer}</p>
                        {cert.link && (
                          <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            View Certificate →
                          </a>
                        )}
                      </div>
                      <button onClick={() => removeCertificate(idx)} type="button">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:sticky lg:top-24 self-start">
        <CVPreview
          cvInfo={cvInfo}
          projects={selectedProjects}
          education={education}
          leadership={leadership}
          certificates={certificates}
          user={user}
        />
      </div>
    </div>
  );
}


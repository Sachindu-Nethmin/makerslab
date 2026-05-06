"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, FileDown, Loader2, CheckCircle2 } from "lucide-react";
import { CVTemplate } from "./cv-template";
import { toast } from "sonner";
import { CVInfo, CVProject, Education, Leadership, Certificate } from "./types";

interface CVPreviewProps {
  cvInfo: CVInfo;
  projects: CVProject[];
  education?: Education;
  leadership?: Leadership[];
  certificates?: Certificate[];
  user: any;
}

export function CVPreview({ cvInfo, projects, education, leadership, certificates, user }: CVPreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportComplete(false);
    try {
      const element = document.getElementById("cv-printable-area");
      if (!element) {
        toast.error("Could not find CV content");
        return;
      }

      const safeName = String(cvInfo.name || "Untitled").trim();
      const filename = `${safeName.replace(/\s+/g, "_")}_CV.pdf`;

      // Send the HTML content to our backend API
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: element.outerHTML,
          filename: filename,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate PDF";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Convert the response to a blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportComplete(true);
      toast.success("CV exported successfully");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 no-print">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">CV Preview</h3>
          <p className="text-sm text-muted-foreground">This is how your CV will look.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-9">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="h-9 shadow-lg shadow-primary/20" 
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-2 shadow-2xl bg-white">
        <CardContent className="p-0 text-black overflow-auto max-h-[800px] lg:max-h-[calc(100vh-250px)] scrollbar-hide">
          <div className="scale-[0.6] sm:scale-[0.8] md:scale-90 lg:scale-100 origin-top p-4 sm:p-8 md:p-12">
            <CVTemplate
              cvInfo={cvInfo}
              projects={projects}
              education={education}
              leadership={leadership}
              certificates={certificates}
            />
          </div>
        </CardContent>
      </Card>
      
      {exportComplete ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Download Complete</p>
            <p className="text-xs text-green-700">
              Your professional CV has been exported. The layout is optimized for A4 format.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <FileDown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">Ready for Export</p>
            <p className="text-xs text-primary/80">
              Optimized for A4 — click Export PDF when you're ready to download.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


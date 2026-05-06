"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, FileDown, Loader2 } from "lucide-react";
import { CVTemplate } from "./cv-template";
import { toast } from "sonner";

interface CVPreviewProps {
  cvInfo: any;
  projects: any[];
  education?: any;
  leadership?: any[];
  certificates?: any[];
}

export function CVPreview({ cvInfo, projects, education, leadership, certificates }: CVPreviewProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("cv-printable-area");
      if (!element) {
        toast.error("Could not find CV content");
        return;
      }

      const filename = `${cvInfo.name.replace(/\s+/g, "_")}_CV.pdf`;

      // Create HTML for printing with Tailwind CSS
      const printHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* {
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
}
@page {
  size: A4;
  margin: 0;
  padding: 0;
}
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: white;
}
body {
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.5;
}
#cv-printable-area {
  padding: 20mm;
  background: white;
  width: 100%;
}
@media print {
  body {
    margin: 0;
    padding: 0;
    background: white;
  }
  #cv-printable-area {
    padding: 20mm;
    margin: 0;
  }
  .no-print { display: none !important; }
  nav, button { display: none !important; }
}
</style>
</head>
<body style="margin:0; padding:0; background:white;">
${element.outerHTML}
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    window.print();
  }, 1000);
});
</script>
</body>
</html>`;

      // Open in a new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();
      } else {
        throw new Error("Could not open print window. Please check popup blockers.");
      }

      toast.success("Print dialog opened. Select 'Save as PDF' to download.");
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
      
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <FileDown className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Download Complete</p>
          <p className="text-xs text-primary/80">
            Your professional CV is ready for submission. The layout is optimized for A4 format.
          </p>
        </div>
      </div>
    </div>
  );
}

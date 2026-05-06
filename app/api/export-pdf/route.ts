import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    const { html, filename } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 });
    }

    console.log("PDF Export - HTML length:", html.length);
    console.log("PDF Export - HTML content preview:", html.substring(0, 500));

    // Launch puppeteer
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (error) {
      console.error("Puppeteer launch error:", error);
      throw new Error(
        "Could not launch browser for PDF generation. " +
        "Ensure Chromium is installed by running: npx puppeteer browsers install chrome"
      );
    }

    const page = await browser.newPage();

    // Set viewport to A4 dimensions (794x1123 at 96 DPI)
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    // Log console messages from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('error', err => console.error('PAGE ERROR:', err));

    // Wrap the HTML element in a complete document with Tailwind
    const wrappedHtml = `<!DOCTYPE html>
<html lang="en">
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
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: white;
}
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  padding: 0;
}
@page {
  size: A4;
  margin: 0;
}
#cv-printable-area {
  width: 100%;
  max-width: 100%;
}
</style>
</head>
<body style="margin:0;padding:0;background:white;">
${html}
</body>
</html>`;

    try {
      await page.setContent(wrappedHtml, {
        waitUntil: ["domcontentloaded", "networkidle2"]
      });
    } catch (contentError) {
      console.error("Error setting content:", contentError);
      throw contentError;
    }

    // Wait for Tailwind to compile and fonts to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Debug: Check if content is actually rendered
    const contentCheck = await page.evaluate(() => {
      const elem = document.getElementById('cv-printable-area');
      if (!elem) {
        return {
          exists: false,
          bodyHTML: document.body.innerHTML.substring(0, 200),
          bodyChildren: document.body.children.length,
        };
      }
      const styles = window.getComputedStyle(elem);
      return {
        exists: true,
        innerHTML: elem.innerHTML.length,
        textContent: elem.textContent?.length || 0,
        offsetHeight: elem.offsetHeight,
        offsetWidth: elem.offsetWidth,
        offsetTop: (elem as any).offsetTop,
        offsetLeft: (elem as any).offsetLeft,
        display: styles.display,
        visibility: styles.visibility,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });
    console.log("Content check:", JSON.stringify(contentCheck));

    // Generate screenshot for debugging
    const screenshot = await page.screenshot({ fullPage: true });
    console.log(`Screenshot generated: ${screenshot.length} bytes`);

    // Check if page bounds are correct
    const metrics = await page.metrics();
    console.log("Page metrics:", JSON.stringify(metrics));

    // Try to generate PDF with different approach
    console.log("Attempting PDF generation with A4 format...");
    let pdfBuffer;
    try {
      // First attempt: Standard A4 PDF
      pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      console.log(`Generated PDF (attempt 1) - size: ${pdfBuffer.length} bytes`);

      // If empty, try different settings
      if (pdfBuffer.length === 0) {
        console.warn("PDF buffer is empty, trying alternative settings...");
        pdfBuffer = await page.pdf({
          width: "210mm",
          height: "297mm",
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          printBackground: true,
        });
        console.log(`Generated PDF (attempt 2) - size: ${pdfBuffer.length} bytes`);
      }

      // If still empty, try with no margin specs
      if (pdfBuffer.length === 0) {
        console.warn("PDF still empty, trying without margin settings...");
        pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
        });
        console.log(`Generated PDF (attempt 3) - size: ${pdfBuffer.length} bytes`);
      }
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      throw pdfError;
    }

    console.log(`Final PDF buffer size: ${pdfBuffer.length} bytes`);

    await browser.close();

    if (pdfBuffer.length === 0) {
      const errorMsg = `Generated PDF is empty (0 bytes). Content check: ${JSON.stringify(contentCheck)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (pdfBuffer.length < 5000) {
      console.warn(`Warning: PDF is small (${pdfBuffer.length} bytes) - check if content rendered correctly`);
    }

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="${filename || "CV.pdf"}"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF: " + error.message },
      { status: 500 }
    );
  }
}

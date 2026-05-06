import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { auth } from "@/auth";

export const runtime = 'nodejs';

// SSRF Protection: Block access to local and private networks
const isPrivateNetwork = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("172.16.") || // Should check range 172.16.0.0 – 172.31.255.255
      hostname.startsWith("169.254.")
    );
  } catch (e) {
    return true; // Block invalid URLs
  }
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let browser;
  try {
    const body = await req.json();
    const { html, filename } = body;

    if (!html) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 });
    }

    // Payload size limit (e.g., 2MB)
    if (JSON.stringify(body).length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const isDebug = process.env.NODE_ENV !== "production" || process.env.DEBUG_PDF === "true";

    if (isDebug) {
      console.log("PDF Export - HTML length:", html.length);
    }

    // Launch puppeteer-core with @sparticuz/chromium
    let executablePath: string | undefined;

    try {
      executablePath = await chromium.executablePath();
    } catch (e) {
      // Chromium not available, use system browser
    }

    // Local development fallback for Windows/MacOS
    if (!executablePath && process.env.NODE_ENV === "development") {
      const { platform } = process;
      if (platform === "win32") {
        executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
        const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
        const fs = require('fs');
        if (!fs.existsSync(executablePath) && fs.existsSync(edgePath)) {
          executablePath = edgePath;
        }
      } else if (platform === "darwin") {
        executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      }
    }

    const launchConfig: any = {
      args: (chromium as any).args || ["--no-sandbox"],
      executablePath,
      defaultViewport: (chromium as any).defaultViewport,
      headless: (chromium as any).headless,
    };

    browser = await puppeteer.launch(launchConfig);

    const page = await browser.newPage();

    // SSRF Protection
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (isPrivateNetwork(request.url())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Set viewport to A4 dimensions
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    if (isDebug) {
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('error', err => console.error('PAGE ERROR:', err));
    }

    // Wrap the HTML element in a complete document
    // NOTE: Removed Tailwind CDN. Relying on pre-inlined or global styles.
    const wrappedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

    await page.setContent(wrappedHtml, {
      waitUntil: "load"
    });

    // Deterministic readiness check: wait for fonts and layout
    await page.evaluateHandle(() => (document as any).fonts.ready);
    await page.waitForFunction(() => {
      const elem = document.getElementById('cv-printable-area');
      return elem && elem.offsetHeight > 0;
    }, { timeout: 5000 });

    if (isDebug) {
      const metrics = await page.metrics();
      console.log("Page metrics:", JSON.stringify(metrics));
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    if (pdfBuffer.length === 0) {
      throw new Error("Generated PDF is empty");
    }

    // Sanitize filename
    const safeFilename = (filename || "CV.pdf")
      .replace(/[\r\n"']/g, "")
      .replace(/\s+/g, "_");
    const encodedFilename = encodeURIComponent(safeFilename);

    return new NextResponse(Buffer.from(pdfBuffer) as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isDebug = process.env.NODE_ENV !== "production" || process.env.DEBUG_PDF === "true";
    
    console.error("PDF generation error:", error);
    
    return NextResponse.json(
      { 
        error: isDebug ? `Failed to generate PDF: ${errorMsg}` : "Failed to generate PDF",
        detail: isDebug && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close().catch(err => console.error("Error closing browser:", err));
    }
  }
}


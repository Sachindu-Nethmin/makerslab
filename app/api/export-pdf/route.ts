import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { auth } from "@/auth";
import fs from "fs";

export const runtime = 'nodejs';

// SSRF Protection: Block access to local and private networks
const isPrivateNetwork = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    
    // 1. Validate URL protocol - only allow standard web protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return true; // Block non-standard protocols
    }

    let hostname = parsedUrl.hostname.toLowerCase();
    
    // 2. Handle IPv6 bracketed forms
    if (hostname.startsWith("[") && hostname.endsWith("]")) {
      hostname = hostname.slice(1, -1);
    }

    // 3. IPv4 Checks
    if (
      hostname === "localhost" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.")
    ) {
      return true;
    }

    // Expand 172.16.0.0/12 range (172.16.0.0 – 172.31.255.255)
    if (hostname.startsWith("172.")) {
      const parts = hostname.split(".");
      if (parts.length === 4) {
        const secondOctet = parseInt(parts[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) return true;
      }
    }

    // 4. IPv6 Checks
    // Loopback
    if (hostname === "::1" || hostname === "0:0:0:0:0:0:0:1") {
      return true;
    }

    // Link-local fe80::/10 (fe80... to febf...)
    if (hostname.startsWith("fe8") || hostname.startsWith("fe9") || 
        hostname.startsWith("fea") || hostname.startsWith("feb")) {
      return true;
    }

    // Unique Local Address (ULA) fc00::/7 (fc00... to fdff...)
    if (hostname.startsWith("fc") || hostname.startsWith("fd")) {
      return true;
    }

    return false;
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
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = await req.json();
    const { html, filename } = body;

    if (typeof html !== "string" || !html) {
      return NextResponse.json({ error: "HTML content must be a string and is required" }, { status: 400 });
    }

    // Payload size limit (e.g., 2MB)
    if (Buffer.byteLength(html, "utf8") > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const isDebug = process.env.NODE_ENV !== "production" || process.env.DEBUG_PDF === "true";

    if (isDebug) {
      console.log("PDF Export - HTML length:", html.length);
    }

    // Launch puppeteer-core
    let executablePath: string | null = null;
    const isDevelopment = process.env.NODE_ENV !== "production";

    // 1. Try to find local system browser first if in development
    if (isDevelopment) {
      const { platform } = process;
      if (platform === "win32") {
        const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
        const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
        if (fs.existsSync(chromePath)) {
          executablePath = chromePath;
        } else if (fs.existsSync(edgePath)) {
          executablePath = edgePath;
        }
      } else if (platform === "darwin") {
        const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        if (fs.existsSync(chromePath)) {
          executablePath = chromePath;
        }
      }
    }

    // 2. If not found or not in development, try @sparticuz/chromium
    if (!executablePath) {
      try {
        const sparticuzPath = await chromium.executablePath();
        // Only use it if the file actually exists
        if (sparticuzPath && fs.existsSync(sparticuzPath)) {
          executablePath = sparticuzPath;
        }
      } catch (e) {
        if (isDebug) console.error("Error getting @sparticuz/chromium path:", e);
      }
    }

    if (!executablePath) {
      throw new Error("Could not find a valid browser executable (Chrome, Edge, or Chromium)");
    }

    if (isDebug) {
      console.log("Using browser executable at:", executablePath);
    }

    const launchConfig = {
      args: isDevelopment ? [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ] : chromium.args,
      executablePath,
      // @ts-expect-error: sparticuz/chromium types are incomplete
      defaultViewport: chromium.defaultViewport,
      // @ts-expect-error: sparticuz/chromium types are incomplete
      headless: chromium.headless,
    };

    browser = await puppeteer.launch(launchConfig);

    const page = await browser.newPage();

    // SSRF Protection
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (isPrivateNetwork(url)) {
        if (isDebug) console.warn("SSRF Protection: Blocking request to", url);
        request.abort();
      } else {
        request.continue();
      }
    });

    // Don't set viewport - let puppeteer handle it for PDF generation
    // Setting viewport can interfere with PDF rendering

    if (isDebug) {
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('error', err => console.error('PAGE ERROR:', err));
    }

    // Wrap the HTML element in a complete document with comprehensive print styles
    const wrappedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* {
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  background: white;
  margin: 0;
  padding: 0;
}

body {
  display: block;
}

@page {
  size: A4;
  margin: 0;
}

body, html {
  margin: 0 !important;
  padding: 0 !important;
}

#cv-printable-area {
  width: 210mm;
  padding: 20mm;
  box-sizing: border-box;
  background: white;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  margin: 0 !important;
  min-height: 297mm;
}

nav, footer, button, [class*="no-print"] {
  display: none !important;
}
</style>
</head>
<body>
${html}
</body>
</html>`;

    await page.setContent(wrappedHtml, {
      waitUntil: "load"
    });

    // Deterministic readiness check: wait for fonts and layout
    try {
      await page.evaluate(() => document.fonts.ready);
    } catch {
      if (isDebug) console.log("Font loading not available");
    }

    // Wait for content to render
    await page.waitForFunction(() => {
      const elem = document.getElementById('cv-printable-area');
      if (!elem) {
        console.log("Element cv-printable-area not found");
        return false;
      }
      if (elem.offsetHeight === 0) {
        console.log("Element height is 0");
        return false;
      }
      return true;
    }, { timeout: 10000 });


    if (isDebug) {
      const metrics = await page.metrics();
      console.log("Page metrics:", JSON.stringify(metrics));
    }


    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      preferCSSPageSize: true,
    });

    if (isDebug) {
      console.log("PDF Buffer length:", pdfBuffer.length);
    }

    if (pdfBuffer.length === 0) {
      throw new Error("Generated PDF is empty - content may not have rendered");
    }

    // Sanitize filename
    const fallbackFilename = typeof filename === "string" ? filename : "CV.pdf";
    const safeFilename = fallbackFilename
      .replace(/[^\x20-\x7E]/g, "") // Strip non-ASCII
      .replace(/[\r\n"']/g, "")
      .replace(/\s+/g, "_");
    const encodedFilename = encodeURIComponent(fallbackFilename);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`
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


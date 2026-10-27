
const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const { Transform } = require("stream");
const { pipeline } = require("stream/promises");
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// UPLOAD CONFIG
const upload = multer({ dest: "uploads/" });

// OUTPUT FOLDER AND BASE URL
const OUTPUT_DIR = path.join(__dirname, "downloads");
const BASE_URL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2";

// SANITIZE HELPERS
function sanitizeName(value) {
    return String(value || "")
        .trim()
        .replace(/['’]/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function sanitizeCountry(value) {
    return String(value || "")
        .trim()
        .replace(/['’]/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function sanitizeLanguage(value) {
    return String(value || "")
        .trim()
        .replace(/['’]/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getCountryCode(country) {
    const countryCodeMap = {
        "United States": "US",
        "United Kingdom": "UK",
        Canada: "CA",
        Germany: "DE",
        France: "FR",
        Italy: "IT",
        Spain: "ES",
        Brazil: "BR",
        Australia: "AU",
        India: "IN",
        Japan: "JP",
        China: "CN",
        Netherlands: "NL",
        Belgium: "BE",
        Switzerland: "CH",
        Austria: "AT",
        Sweden: "SE",
        Norway: "NO",
        Denmark: "DK",
        Finland: "FI",
        Ireland: "IE",
        Israel: "IL",
        "Saudi Arabia": "SA",
        "United Arab Emirates": "AE",
        "South Africa": "ZA",
        Mexico: "MX",
        Portugal: "PT",
        Poland: "PL",
        Singapore: "SG",
        Malaysia: "MY",
        Thailand: "TH",
        "New Zealand": "NZ",
        Korea: "KR",
        "Hong Kong": "HK",
        Taiwan: "TW",
        Luxembourg: "LU"
    };

    return countryCodeMap[country] || sanitizeCountry(country).toUpperCase();
}

// NORMALIZE AND DOWNLOAD PDF
function normalizePdfUrl(url) {
    let finalUrl = String(url || "").trim();

    if (!finalUrl) return "";

    if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
    }

    return finalUrl;
}






async function downloadPDF(url, destination) {
    const maxAttempts = 1;
    const timeout = 60000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        let response;

        const timer = setTimeout(() => {
            controller.abort();
        }, timeout);

        try {
            console.log(
                `⬇️ PDF download attempt ${attempt}/${maxAttempts}: ${url}`
            );

            response = await axios({
                method: "GET",
                url,
                responseType: "stream",
                timeout,
                signal: controller.signal,
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            console.log("📥 PDF response received. Saving file...");

            await pipeline(
                response.data,
                fs.createWriteStream(destination),
                { signal: controller.signal }
            );

            console.log("✅ PDF downloaded successfully");
            return true;

        } catch (err) {
            await fs.remove(destination).catch(() => {});

            console.error(
                `❌ PDF attempt ${attempt} failed:`,
                controller.signal.aborted
                    ? "Download timed out"
                    : err.message
            );

            if (
                err.code === "ENOTFOUND" ||
                err.code === "EAI_AGAIN"
            ) {
                console.log("⚠️ PDF host unavailable. Skipping retry.");
                return false;
            }

            if (attempt === maxAttempts) {
                console.log(
                    "⚠️ PDF download failed after retry. Continuing without PDF."
                );
                return false;
            }

            console.log("🔁 Retrying PDF download...");

        } finally {
            clearTimeout(timer);
            response?.data?.destroy();
        }
    }

    return false;
}




// GET MARKETO TITLE AND ABSTRACT
// Excel column E should be sent as item.marketoUrl.
async function getMarketoContent(marketoUrl) {
    if (!marketoUrl) {
        throw new Error(
            "Marketo Landing Page URL is missing (Excel column E)"
        );
    }

    const response = await axios.get(marketoUrl, {
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(response.data);

    // Get visible title from Marketo page's H1
    const title = $("#mainBodyCopy h1").first().text().trim();

    // Get abstract HTML
    const abstract =
        $("#mainBodyCopy > div").first().html()?.trim() || "";

    if (!title) {
        throw new Error(`Title (H1) not found: ${marketoUrl}`);
    }

    if (!abstract) {
        throw new Error(
            `Abstract (#mainBodyCopy > div) not found: ${marketoUrl}`
        );
    }

    console.log("\n📝 MARKETO CONTENT STATUS");
    console.log("✅ Title extracted:", title);
    console.log(
        "✅ Abstract extracted:",
        abstract.replace(/<[^>]*>/g, " ").trim().slice(0, 200)
    );
    console.log("📏 Abstract length:", abstract.length, "characters");

    return { title, abstract };
}




function replaceAbstractContent($, marketoAbstract) {
    if (!marketoAbstract || !marketoAbstract.trim()) {
        console.log("⚠️ Marketo abstract is empty");
        return false;
    }

    // First, find the abstract container in index.html
    let target = $(".description")
        .find("div")
        .filter(function () {
            return $(this).children("p, ul, ol").length > 0;
        })
        .first();

    // If not found, find the abstract container in edm.html
    if (!target.length) {
        target = $('td[dir="ltr"] > div')
            .filter(function () {
                return $(this).children("p, ul, ol").length > 0;
            })
            .first();
    }

    if (!target.length) {
        console.log("❌ Abstract container not found");
        return false;
    }

    // Replace the old abstract with the new Marketo abstract
    target.html(marketoAbstract);

    console.log("✅ Marketo abstract replaced successfully");
    return true;
}

// UPDATE HTML TEMPLATE WITH MARKETO CONTENT

function injectMarketoIntoHtml(content, marketoTitle, marketoAbstract) {
    console.log("\n📝 INJECTING MARKETO CONTENT");
    console.log("🎯 New title:", marketoTitle);
    console.log(
        "📄 Abstract received:",
        marketoAbstract ? "YES" : "NO"
    );

    const $ = cheerio.load(content, {
        decodeEntities: false
    });

    // 1. Replace document title
    if (marketoTitle && $("title").length) {
        $("title").first().text(marketoTitle);
    }

    // 2. Replace visible blue-header title
    if (marketoTitle) {
        $("#div1 table tbody tr td p span strong").each(function () {
            $(this).text(marketoTitle);
        });
    }

    // 3. Replace abstract for index.html and edm.html
    const abstractUpdated = replaceAbstractContent(
        $,
        marketoAbstract
    );

    if (!abstractUpdated) {
        console.log("⚠️ Abstract was not updated");
    }

    // 4. Replace optional Marketo placeholders
    let output = $.html();

    output = output
        .replace(/\{\{MARKETO_TITLE\}\}/g, marketoTitle || "")
        .replace(
            /\{\{MARKETO_ABSTRACT\}\}/g,
            marketoAbstract || ""
        );

    return output;
}





function encodeEmailSubject(title) {
    return `=?UTF-8?B?${Buffer.from(title || "", "utf8").toString("base64")}?=`;
}

function injectSubjectIntoPhp(content, title) {
    const encodedTitle = encodeEmailSubject(title);

    const subjectRegex =
        /(\$mail->Subject\s*=\s*')([\s\S]*?)(';)/;

    if (!subjectRegex.test(content)) {
        console.warn("Could not find $mail->Subject assignment");
        return content;
    }

    return content.replace(
        subjectRegex,
        (match, prefix, subject, suffix) => {
            // Match an existing Base64-encoded title inside double quotes.
            const encodedTitleRegex =
                /"=\?UTF-8\?B\?[^?]*\?="/;

            if (encodedTitleRegex.test(subject)) {
                // Preserve existing encoded-subject functionality.
                const updatedSubject = subject.replace(
                    encodedTitleRegex,
                    `"${encodedTitle}"`
                );

                console.log("✅ Encoded email subject updated");

                return `${prefix}${updatedSubject}${suffix}`;
            }

            // For plain-text subjects, replace only the title inside double quotes.
            const quotedTitleRegex = /"[^"]*"/;

            if (quotedTitleRegex.test(subject)) {
                const updatedSubject = subject.replace(
                    quotedTitleRegex,
                    `"${title || ""}"`
                );

                console.log("✅ Plain-text email title updated");

                return `${prefix}${updatedSubject}${suffix}`;
            }

            console.warn("Could not find the quoted email title");
            return match;
        }
    );
}
function getLanguageCodeFromMarketoUrl(marketoUrl) {
    try {
        const url = new URL(marketoUrl);
        return url.searchParams.get("lcid") || "";
    } catch (error) {
        console.warn("Invalid Marketo URL:", marketoUrl);
        return "";
    }
}




async function generateOutputExcel(assets) {
    const outputPath = path.join(__dirname, "output_excel.xlsx");

    let workbook = new ExcelJS.Workbook();
    let worksheet;

    if (await fs.pathExists(outputPath)) {
        await workbook.xlsx.readFile(outputPath);
        worksheet = workbook.getWorksheet("Output");
    }

    if (!worksheet) {
        worksheet = workbook.addWorksheet("Output");

        worksheet.columns = [
            { header: "Activate Page", key: "activatePage", width: 65 },
            { header: "MSFT Page", key: "msftPage", width: 65 },
            { header: "Language Code", key: "languageCode", width: 18 },
            { header: "LOB", key: "lob", width: 22 },
            { header: "Hub", key: "hub", width: 18 },
            { header: "Asset", key: "asset", width: 75 }
        ];

        worksheet.getRow(1).font = { bold: true };
    }

    // Find the next empty row
    let nextRow = worksheet.lastRow
        ? worksheet.lastRow.number + 1
        : 2;

    console.log("Next row before adding:", nextRow);

    for (const asset of assets) {
        worksheet.getRow(nextRow).values = [
            asset.activatePage || "",
            asset.msftPage || "",
            asset.languageCode || "",
            asset.lob || "",
            asset.hub || "",
            asset.asset || ""
        ];

        nextRow++;
    }

    await workbook.xlsx.writeFile(outputPath);

    // Verify the saved file
    const verifyWorkbook = new ExcelJS.Workbook();
    await verifyWorkbook.xlsx.readFile(outputPath);

    const verifySheet = verifyWorkbook.getWorksheet("Output");

    console.log("SAVED EXCEL PATH:", outputPath);
    console.log("SAVED TOTAL ROWS:", verifySheet.rowCount);
    console.log("Last row values:", verifySheet.lastRow.values);

    return outputPath;
}






// CREATE ASSET TEMPLATE
async function createAssetTemplate({
    assetFolder,
    countryFolder,
    languageFolder,
    assetFolderName,
    assetTitle,
    country,
    language,
    marketoTitle,
    marketoAbstract
}) {
    const templateFolder = path.join(
        __dirname,
        "templates",
        countryFolder,
        languageFolder,
        "1"
    );

    console.log("📁 Template Folder:", templateFolder);

   const templateFiles = [
    "edm.html",
    "index.html",
    "sendemail.php",
    "thankyou_1.html"
];

for (const file of templateFiles) {
    const sourcePath = path.join(templateFolder, file);
    const destinationPath = path.join(assetFolder, file);

    // thankyou_1.html is optional
    if (file === "thankyou_1.html" && !(await fs.pathExists(sourcePath))) {
        console.log(`⚠️ Optional file not found, skipping: ${file}`);
        continue;
    }

    // Required files should still throw an error if missing
    if (!(await fs.pathExists(sourcePath))) {
        throw new Error(`Template file not found: ${sourcePath}`);
    }

    await fs.copy(sourcePath, destinationPath);
    console.log(`✅ Copied: ${file}`);
}

    const assetURL =
        `${BASE_URL}/${countryFolder}/${languageFolder}/${assetFolderName}`;

    const assetPDFURL = `${assetURL}/asset.pdf`;

    const countryCode = getCountryCode(country);

    const campId =
        `MSFT-FY27Q2-${countryCode}-${languageFolder}-${assetFolderName}`;

        let hub = "";

    console.log("🔗 Asset URL:", assetURL);
    console.log("📄 Asset PDF URL:", assetPDFURL);
    console.log("🆔 Camp ID:", campId);

    if (!(await fs.pathExists(templateFolder))) {
        throw new Error(`Template folder not found: ${templateFolder}`);
    }

    for (const fileName of templateFiles) {
        const sourceFile = path.join(templateFolder, fileName);
        const destinationFile = path.join(assetFolder, fileName);

   
if (!(await fs.pathExists(sourceFile))) {
    if (fileName === "thankyou_1.html") {
        console.log(
            "⚠️ thankyou_1.html not found, skipping processing."
        );
        continue;
    }

    throw new Error(`Template file not found: ${sourceFile}`);
}


        let content = await fs.readFile(sourceFile, "utf8");

        if (fileName === "edm.html") {
            // Keep the existing asset URL replacement.
            content = content.replace(
                /https?:\/\/b2b-insight\.biz-tech-insights\.com\/MSFT\/FY27Q2\/[^"'\s<>]*/g,
                assetURL
            );

            content = injectMarketoIntoHtml(
                content,
                marketoTitle,
                marketoAbstract
            );
        }

        if (fileName === "index.html") {
            content = content.replace(
                /value="MSFT-FY27Q2-[^"]+"/,
                `value="${campId}"`
            );

            content = injectMarketoIntoHtml(
                content,
                marketoTitle,
                marketoAbstract
            );
        }

        if (fileName === "sendemail.php") {
            console.log("\n📧 SEND EMAIL TEMPLATE STATUS");
            console.log("📄 Source template:", sourceFile);
            console.log("🎯 New asset URL:", assetURL);
            console.log("📄 New PDF URL:", assetPDFURL);

            // Replace only matching asset.pdf links in the email body.
            const emailPdfRegex =
                /(\bhref\s*=\s*['"])https?:\/\/b2b-insight\.biz-tech-insights\.com\/MSFT\/FY27Q2\/[^'"]*\/asset\.pdf(['"])/gi;

            const oldPdfLinks = [...content.matchAll(emailPdfRegex)]
                .map(m => m[0]);

            content = content.replace(
                emailPdfRegex,
                (match, prefix, suffix) =>
                    `${prefix}${assetPDFURL}${suffix}`
            );

            console.log(`🔄 Email PDF links found: ${oldPdfLinks.length}`);

            oldPdfLinks.forEach((oldLink, index) => {
                console.log(`   OLD ${index + 1}: ${oldLink}`);
                console.log(
                    `   NEW ${index + 1}: href='${assetPDFURL}'`
                );
            });

            console.log(
                oldPdfLinks.length
                    ? "✅ Email PDF link replacement completed"
                    : "⚠️ No matching email PDF links found"
            );

            // Update hardcoded $ENDURL paths, preserving the existing filename.
            const endUrlRegex =
                /(\$ENDURL\s*=\s*")[^"]*\/(thankyou(?:_1)?\.html|asset\.pdf)(")/gi;

            const endUrlMatches = [...content.matchAll(endUrlRegex)];

            content = content.replace(
                endUrlRegex,
                (match, prefix, filename, suffix) => {
                    const newUrl = `${assetURL}/${filename}`;

                    console.log(
                        `🔄 $ENDURL filename preserved: ${filename}`
                    );
                    console.log(`   OLD: ${match}`);
                    console.log(`   NEW: $ENDURL = "${newUrl}";`);

                    return `${prefix}${newUrl}${suffix}`;
                }
            );

            console.log(
                endUrlMatches.length
                    ? `✅ $ENDURL assignment(s) updated: ${endUrlMatches.length}`
                    : "ℹ️ No hardcoded $ENDURL assignment matched (existing country logic preserved)"
            );

            // Update matching JavaScript redirects while preserving the filename.
            const redirectRegex =
                /(window\.location\.href\s*=\s*')[^']*\/(thankyou(?:_1)?\.html|asset\.pdf)'/gi;

            const redirectMatches = [...content.matchAll(redirectRegex)];

            content = content.replace(
                redirectRegex,
                (match, prefix, filename) => {
                    const newUrl = `${assetURL}/${filename}`;

                    console.log(
                        `🔄 JavaScript redirect filename preserved: ${filename}`
                    );
                    console.log(`   OLD: ${match}`);
                    console.log(`   NEW: ${prefix}${newUrl}'`);

                    return `${prefix}${newUrl}'`;
                }
            );

            console.log(
                redirectMatches.length
                    ? `✅ JavaScript redirect(s) updated: ${redirectMatches.length}`
                    : "ℹ️ No matching hardcoded JavaScript redirect found"
            );

// Update only the Marketo title inside the email body paragraph.
const encodedMarketoTitle = marketoTitle
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/ä/g, "&#228;")
    .replace(/ö/g, "&#246;")
    .replace(/ü/g, "&#252;")
    .replace(/Ä/g, "&#196;")
    .replace(/Ö/g, "&#214;")
    .replace(/Ü/g, "&#220;")
    .replace(/ß/g, "&#223;");

content = content.replace(
    /(<p\b[^>]*>[\s\S]*?<strong\b[^>]*>)[\s\S]*?(<\/strong>)([\s\S]*?<\/p>)/i,
    (match, before, strongClose, after) =>
        `${before}${encodedMarketoTitle}${strongClose}${after}`
);


            // Update email subject.
            const subjectBefore = content;
            content = injectSubjectIntoPhp(content, marketoTitle);

            console.log(
                content !== subjectBefore
                    ? "✅ Email subject updated"
                    : "⚠️ Email subject unchanged; check $mail->Subject assignment"
            );
        }


        
if (fileName === "thankyou_1.html") {
    content = content.replace(
        /(<title\b[^>]*>)[\s\S]*?(<\/title>)/i,
        (_, start, end) => `${start}${marketoTitle}${end}`
    );

    content = content.replace(
        /(<strong\b[^>]*>)[\s\S]*?(<\/strong>)/i,
        (_, start, end) => `${start}${marketoTitle}${end}`
    );
}










await fs.writeFile(destinationFile, content, "utf8");

console.log(`✅ Created: ${destinationFile}`);

// Extract Hub from index.html only
if (path.basename(destinationFile).toLowerCase() === "index.html") {
    hub = extractHub(content);
   // console.log("Extracted Hub:", hub);
}
    }

    return { assetURL, assetPDFURL, campId,hub  };
}


function extractHub(indexHtml) {
    const match = indexHtml.match(
        /const\s+region\s*=\s*["']([^"']+)["']/
    );

    return match ? match[1] : "";
}




 // HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// OLD UPLOAD API
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        console.log("📂 Uploaded file:", req.file.originalname);

        res.json({
            success: true,
            message: "Excel uploaded successfully"
        });
    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).send("Server Error");
    }
});

// GENERATE ASSETS


app.post("/generate", async (req, res) => {
    try {
        console.log("\n=================================");
        console.log("🚀 GENERATE REQUEST RECEIVED");
        console.log("=================================\n");

        const assets = req.body.assets;

        if (!Array.isArray(assets)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assets data"
            });
        }

        if (assets.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No assets found"
            });
        }

        console.log(`📦 Total assets received: ${assets.length}`);

        await fs.ensureDir(OUTPUT_DIR);

        const results = [];
        let successCount = 0;
        let failedCount = 0;
        const outputRows = [];

        for (let i = 0; i < assets.length; i++) {
            const item = assets[i];

            const assetTitle = String(item.assetTitle || "").trim();
            const country = String(item.country || "").trim();
            const language = String(item.language || "").trim();
            const pdf = String(item.pdf || "").trim();

            const marketoUrl = String(
                item.marketoUrl || item.marketoLandingPageUrl || ""
            ).trim();

            console.log(`\n[${i + 1}/${assets.length}]`);
            console.log("Asset:", assetTitle);
            console.log("Country:", country);
            console.log("Language:", language);
            console.log("PDF:", pdf);
            console.log("Marketo URL:", marketoUrl || "(missing)");

            if (!assetTitle || !country || !language || !pdf || !marketoUrl) {
                failedCount++;

                results.push({
                    assetTitle,
                    country,
                    language,
                    status: "failed",
                    message: "Missing required information"
                });

                continue;
            }

            const countryFolder = sanitizeCountry(country);
            const languageFolder = sanitizeLanguage(language);
            const assetFolderName = sanitizeName(assetTitle);

            const assetFolder = path.join(
                OUTPUT_DIR,
                countryFolder,
                languageFolder,
                assetFolderName
            );

            await fs.ensureDir(assetFolder);

            const pdfFilePath = path.join(assetFolder, "asset.pdf");
            const pdfUrl = normalizePdfUrl(pdf);

            try {
                // 1. Get Marketo content
                const marketoContent = await getMarketoContent(marketoUrl);

                // 2. Download PDF if applicable
                console.log("⬇️ Downloading PDF...");

                let pdfDownloaded = false;

                if (/\.html?(?:[?#]|$)/i.test(pdfUrl)) {
                    console.log(
                        "🎬 HTML/video asset detected. Skipping PDF download."
                    );
                } else {
                    console.time(`PDF Download: ${assetTitle}`);

                    pdfDownloaded = await downloadPDF(
                        pdfUrl,
                        pdfFilePath
                    );

                    console.timeEnd(`PDF Download: ${assetTitle}`);
                }

                if (pdfDownloaded) {
                    console.log("✅ PDF downloaded successfully");
                } else {
                    console.log(
                        "⚠️ PDF unavailable. Continuing template generation."
                    );
                }

                // 3. Generate templates
                const templateResult = await createAssetTemplate({
                    assetFolder,
                    countryFolder,
                    languageFolder,
                    assetFolderName,
                    assetTitle,
                    country,
                    language,
                    marketoTitle: marketoContent.title,
                    marketoAbstract: marketoContent.abstract
                });

                // 4. Extract Hub from generated index.html
                const indexFilePath = path.join(
                    assetFolder,
                    "index.html"
                );

                const indexHtml = await fs.readFile(
                    indexFilePath,
                    "utf8"
                );

                const hub = extractHub(indexHtml);

                console.log("Extracted Hub:", hub);

                if (!hub) {
                    console.warn(
                        "⚠️ Hub value was not found in index.html:",
                        indexFilePath
                    );
                }

                // 5. Build output row
                const generatedURL =
                    `${BASE_URL}/${countryFolder}/${languageFolder}/${assetFolderName}/`;

                const outputRow = {
                    activatePage: generatedURL,
                    msftPage: marketoUrl,
                    languageCode: getLanguageCodeFromMarketoUrl(marketoUrl),
                    lob: item.lob || "",
                    hub: hub || "",
                    asset: pdf
                };

                console.log("Output row:", outputRow);

                outputRows.push(outputRow);

                successCount++;

                results.push({
                    assetTitle,
                    country,
                    language,
                    pdf,
                    marketoUrl,
                    marketoTitle: marketoContent.title,
                    generatedURL,
                    assetURL: templateResult.assetURL,
                    assetPDFURL: templateResult.assetPDFURL,
                    status: "success"
                });

            } catch (itemError) {
                console.error(
                    "❌ Asset generation failed:",
                    itemError.stack || itemError.message
                );

                failedCount++;

                results.push({
                    assetTitle,
                    country,
                    language,
                    status: "failed",
                    message: itemError.message
                });

                continue;
            }
        }

        // 6. Generate Excel once, after processing all assets

        // Generate output Excel only once
        let outputExcelPath = null;

        console.log("COUNTRY SELECTED:", req.body.country);
        console.log(
            "OUTPUT ROWS:",
            JSON.stringify(outputRows, null, 2)
        );

        if (outputRows.length > 0) {
            outputExcelPath = await generateOutputExcel(outputRows);
        }


        console.log("\n=================================");
        console.log("🎉 GENERATION COMPLETED");
        console.log("Total:", assets.length);
        console.log("Success:", successCount);
        console.log("Failed:", failedCount);
        console.log("Excel:", outputExcelPath);
        console.log("=================================\n");

        res.json({
            success: true,
            message: "Asset generation completed",
            total: assets.length,
            successCount,
            failedCount,
            outputExcelPath,
            results
        });

    } catch (error) {
        console.error("\n❌ GENERATE ERROR:", error.stack || error.message);

        res.status(500).json({
            success: false,
            message: "Asset generation failed",
            error: error.message
        });
    }
});


// CREATE TEMPLATE FOLDER
app.post("/create-template-folder", async (req, res) => {
    try {
        const { country, language } = req.body;

        if (!country || !language) {
            return res.status(400).json({
                success: false,
                message: "Country and language are required."
            });
        }

        // Sanitize folder names using your existing helpers
        const countryFolder = sanitizeCountry(country);
        const languageFolder = sanitizeLanguage(language);

        const templateFolder = path.join(
            __dirname,
            "templates",
            countryFolder,
            languageFolder,
            "1"
        );

        // Create folders automatically if they don't exist
        await fs.ensureDir(templateFolder);

        console.log("📁 Template folder ready:", templateFolder);

        return res.json({
            success: true,
            message: "Template folder created successfully.",
            folderPath: templateFolder
        });
    } catch (err) {
        console.error("Template folder creation error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// START SERVER
app.listen(3000, () => {
    console.log("\n🚀 Server running at:");
    console.log("http://localhost:3000");
    console.log("\n📁 Assets will be created inside:");
    console.log(OUTPUT_DIR);
});

const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const cheerio = require("cheerio");

const app = express();

// ==================================================
// MIDDLEWARE
// ==================================================
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ==================================================
// UPLOAD CONFIG
// ==================================================
const upload = multer({ dest: "uploads/" });

// ==================================================
// OUTPUT FOLDER AND BASE URL
// ==================================================
const OUTPUT_DIR = path.join(__dirname, "downloads");
const BASE_URL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY27Q2";

// ==================================================
// SANITIZE HELPERS
// ==================================================
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

// ==================================================
// NORMALIZE AND DOWNLOAD PDF
// ==================================================
function normalizePdfUrl(url) {
    let finalUrl = String(url || "").trim();
    if (!finalUrl) return "";
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
    return finalUrl;
}

async function downloadPDF(url, destination) {
    const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        timeout: 120000,
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(destination);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
        response.data.on("error", reject);
    });
}

// ==================================================
// GET MARKETO TITLE AND ABSTRACT
// Excel column E should be sent as item.marketoUrl.
// ==================================================
async function getMarketoContent(marketoUrl) {
    if (!marketoUrl) {
        throw new Error("Marketo Landing Page URL is missing (Excel column E)");
    }

    const response = await axios.get(marketoUrl, {
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0" }
    });

const $ = cheerio.load(response.data);

// Get visible title from Marketo page's H1
const title = $("#mainBodyCopy h1").first().text().trim();

// Get abstract HTML
const abstract = $("#mainBodyCopy > div").first().html()?.trim() || "";

if (!title) {
    throw new Error(`Title (H1) not found: ${marketoUrl}`);
}

if (!abstract) {
    throw new Error(`Abstract (#mainBodyCopy > div) not found: ${marketoUrl}`);
}


    return { title, abstract };
}

// ==================================================
// UPDATE HTML TEMPLATE WITH MARKETO CONTENT
// ==================================================


function injectMarketoIntoHtml(content, marketoTitle, marketoAbstract) {
    const $ = cheerio.load(content, { decodeEntities: false });

    // 1. Replace document title
    if (marketoTitle && $("title").length) {
        $("title").first().text(marketoTitle);
    }

    // 2. Replace visible blue-header title
    // Works for both edm.html and index.html
    if (marketoTitle) {
        $("#div1 table tbody tr td p span strong").each(function () {
            $(this).text(marketoTitle);
        });
    }

    // 3. EDM: Replace abstract between ABSTRACT markers
    if (
        content.includes("<!-- ABSTRACT_START -->") &&
        content.includes("<!-- ABSTRACT_END -->")
    ) {
        const startMarker = "<!-- ABSTRACT_START -->";
        const endMarker = "<!-- ABSTRACT_END -->";

        const startIndex =
            content.indexOf(startMarker) + startMarker.length;

        const endIndex = content.indexOf(endMarker, startIndex);

        if (endIndex !== -1) {
            content =
                content.substring(0, startIndex) +
                "\n<div>" + (marketoAbstract || "") + "</div>\n" +
                content.substring(endIndex);
        }

        // Reload updated EDM HTML
        const $edm = cheerio.load(content, {
            decodeEntities: false
        });

        // Replace document title
        if (marketoTitle && $edm("title").length) {
            $edm("title").first().text(marketoTitle);
        }

        // Replace blue-header title
        if (marketoTitle) {
            $edm("#div1 table tbody tr td p span strong").each(function () {
                $(this).text(marketoTitle);
            });
        }

        return $edm.html();
    }

    // 4. INDEX: Replace only the abstract div inside .description
    const description = $(".description").first();

    if (description.length && marketoAbstract) {
        const abstractDiv = description
            .find("div")
            .filter(function () {
                return $(this).children("p").length > 0;
            })
            .first();

        if (abstractDiv.length) {
            abstractDiv.html(marketoAbstract);
        }
    }

    // 5. Replace optional explicit placeholders
    let output = $.html();

    output = output
        .replace(/\{\{MARKETO_TITLE\}\}/g, marketoTitle || "")
        .replace(/\{\{MARKETO_ABSTRACT\}\}/g, marketoAbstract || "");

    return output;
}



function encodeEmailSubject(title) {
    const base64Title = Buffer.from(title, "utf8").toString("base64");
    return `=?UTF-8?B?${base64Title}?=`;
}

function injectSubjectIntoPhp(content, title) {
    const encodedSubject = encodeEmailSubject(title);
    const subjectLine = `$mail->Subject = '${encodedSubject}';`;

    // Replace a normal PHP mail subject assignment, regardless of quote style.
    const subjectRegex = /\$mail->Subject\s*=\s*(['"])(?:\\.|(?!\1).)*\1\s*;/;
    if (subjectRegex.test(content)) {
        return content.replace(subjectRegex, subjectLine);
    }

    // If no assignment exists, report it instead of silently pretending it was updated.
    console.warn("⚠️ Could not find $mail->Subject assignment in sendemail.php");
    return content;
}

// ==================================================
// CREATE ASSET TEMPLATE
// ==================================================
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
    const templateFolder = path.join(__dirname, "templates", countryFolder, languageFolder, "1");
    console.log("📁 Template Folder:", templateFolder);

    const templateFiles = ["edm.html", "index.html", "sendemail.php"];
    const assetURL = `${BASE_URL}/${countryFolder}/${languageFolder}/${assetFolderName}`;
    const assetPDFURL = `${assetURL}/asset.pdf`;
    const countryCode = getCountryCode(country);
    const campId = `MSFT-FY27Q2-${countryCode}-${languageFolder}-${assetFolderName}`;

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
            throw new Error(`Template file not found: ${sourceFile}`);
        }

        let content = await fs.readFile(sourceFile, "utf8");

        if (fileName === "edm.html") {
            // Keep the existing asset URL replacement.
            content = content.replace(
                /https?:\/\/b2b-insight\.biz-tech-insights\.com\/MSFT\/FY27Q2\/[^"'\s<>]*/g,
                assetURL
            );
            content = injectMarketoIntoHtml(content, marketoTitle, marketoAbstract);
        }

        if (fileName === "index.html") {
            content = content.replace(/value="MSFT-FY27Q2-[^"]+"/, `value="${campId}"`);
            content = injectMarketoIntoHtml(content, marketoTitle, marketoAbstract);
        }

        if (fileName === "sendemail.php") {
            content = content.replace(/\$ENDURL\s*=\s*"[^"]*"\s*;/, `$ENDURL = "${assetPDFURL}";`);
            content = content.replace(
                /<a href='https?:\/\/b2b-insight\.biz-tech-insights\.com\/MSFT\/FY27Q2\/[^']*'>here<\/a>/g,
                `<a href='${assetPDFURL}'>here</a>`
            );
            content = content.replace(
                /window\.location\.href\s*=\s*'https?:\/\/b2b-insight\.biz-tech-insights\.com\/MSFT\/FY27Q2\/[^']*'/g,
                `window.location.href = '${assetPDFURL}'`
            );
            content = injectSubjectIntoPhp(content, marketoTitle);
        }

        await fs.writeFile(destinationFile, content, "utf8");
        console.log(`✅ Created: ${destinationFile}`);
    }

    return { assetURL, assetPDFURL, campId };
}

// ==================================================
// HOME
// ==================================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ==================================================
// OLD UPLOAD API
// ==================================================
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No file uploaded");
        console.log("📂 Uploaded file:", req.file.originalname);
        res.json({ success: true, message: "Excel uploaded successfully" });
    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).send("Server Error");
    }
});

// ==================================================
// GENERATE ASSETS
// ==================================================
app.post("/generate", async (req, res) => {
    try {
        console.log("\n=================================");
        console.log("🚀 GENERATE REQUEST RECEIVED");
        console.log("=================================\n");

        const assets = req.body.assets;
        if (!Array.isArray(assets)) {
            return res.status(400).json({ success: false, message: "Invalid assets data" });
        }
        if (assets.length === 0) {
            return res.status(400).json({ success: false, message: "No assets found" });
        }

        console.log(`📦 Total assets received: ${assets.length}`);
        await fs.ensureDir(OUTPUT_DIR);

        const results = [];
        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < assets.length; i++) {
            const item = assets[i];
            const assetTitle = String(item.assetTitle || "").trim();
            const country = String(item.country || "").trim();
            const language = String(item.language || "").trim();
            const pdf = String(item.pdf || "").trim();
            const marketoUrl = String(item.marketoUrl || item.marketoLandingPageUrl || "").trim();

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
                    message: "Missing required information (including Marketo Landing Page URL in Excel column E)"
                });
                continue;
            }

            const countryFolder = sanitizeCountry(country);
            const languageFolder = sanitizeLanguage(language);
            const assetFolderName = sanitizeName(assetTitle);
            const assetFolder = path.join(OUTPUT_DIR, countryFolder, languageFolder, assetFolderName);
            await fs.ensureDir(assetFolder);
            const pdfFilePath = path.join(assetFolder, "asset.pdf");
            const pdfUrl = normalizePdfUrl(pdf);

            try {
                // Fetch Marketo title and abstract before writing templates.
                const marketoContent = await getMarketoContent(marketoUrl);

//                 console.log("✅ Extracted Marketo Title:", marketoContent.title);
// console.log("✅ Extracted Marketo Abstract:", marketoContent.abstract);

                console.log("⬇️ Downloading PDF...");
                await downloadPDF(pdfUrl, pdfFilePath);
                console.log("✅ PDF downloaded");

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

                const generatedURL = `${BASE_URL}/${countryFolder}/${languageFolder}/${assetFolderName}/`;
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
                console.error("❌ Asset generation failed:", itemError.message);
                failedCount++;
                results.push({
                    assetTitle,
                    country,
                    language,
                    status: "failed",
                    message: itemError.message
                });
            }
        }

        console.log("\n=================================");
        console.log("🎉 GENERATION COMPLETED");
        console.log("Total:", assets.length);
        console.log("Success:", successCount);
        console.log("Failed:", failedCount);
        console.log("=================================\n");

        res.json({
            success: true,
            message: "Asset generation completed",
            total: assets.length,
            successCount,
            failedCount,
            results
        });
    } catch (error) {
        console.error("\n❌ GENERATE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Asset generation failed",
            error: error.message
        });
    }
});




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

// ==================================================
// START SERVER
// ==================================================
app.listen(3000, () => {
    console.log("\n🚀 Server running at:");
    console.log("http://localhost:3000");
    console.log("\n📁 Assets will be created inside:");
    console.log(OUTPUT_DIR);
});
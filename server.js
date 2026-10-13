const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Serve index.html
app.use(express.static(__dirname));

// Upload config
const upload = multer({ dest: "uploads/" });

const OUTPUT_DIR = path.join(__dirname, "downloads");
const BASE_URL = "https://b2b-insight.biz-tech-insights.com/MSFT/FY26Q4";

// ✅ Reference template folder
const REF_FOLDER_NAME = "3-Reasons-to-Adopt-Consolidated-Security-demo";

// Utility: Clean filename
function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
}

// Utility: Escape special regex characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Download PDF
async function downloadPDF(url, destination) {
    const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(destination);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

// Submit button translations by language
const SUBMIT_TRANSLATIONS = {
    English: "Submit",
    French: "Soumettre",
    German: "Einreichen",
    Japanese: "送信する",
    Spanish: "Enviar",
    Chinese: "提交",
    Portuguese: "Enviar",
    Italian: "Invia",
    Korean: "제출",
    "Chinese (Simplified)": "提交",
    "Chinese (Traditional)": "提交",
};

// ✅ copyReferenceFiles Function — Updated with smart asset name replacement
async function copyReferenceFiles(refDir, assetFolder, originalPath, newPath, { assetTitle, language } = {}) {
    const filesToCopy = ["edm.html", "index.html", "sendemail.php"];

    // Extract old and new asset slugs from paths
    const oldAssetSlug = REF_FOLDER_NAME; // "3-Reasons-to-Adopt-Consolidated-Security-demo"
    const newAssetSlug = newPath.split("/").filter(Boolean).pop(); // "Data-Security-as-a-Foundation-for-Secure-AI-Adoption"

    for (const file of filesToCopy) {
        const src = path.join(refDir, file);
        const dest = path.join(assetFolder, file);

        // Check if reference file exists
        if (!fs.existsSync(src)) {
            console.warn(`⚠️ Reference file not found: ${file} — skipping`);
            continue;
        }

        // Read file content
        let content = await fs.readFile(src, "utf8");

        // ── Step 1: Replace asset name inside ANY path/URL ──
        // Catches the old asset name regardless of what country/FY/language surrounds it
        if (oldAssetSlug && newAssetSlug && oldAssetSlug !== newAssetSlug) {
            // Pattern: /old-asset-name/ → /new-asset-name/ (between slashes)
            content = content.replace(
                new RegExp(`([/\\\\])${escapeRegex(oldAssetSlug)}([/\\\\"')\\s])`, "g"),
                `$1${newAssetSlug}$2`
            );
            // Pattern: /old-asset-name" → /new-asset-name" (before closing quote)
            content = content.replace(
                new RegExp(`([/\\\\])${escapeRegex(oldAssetSlug)}(["'])`, "g"),
                `$1${newAssetSlug}$2`
            );
            // Pattern: /old-asset-name> → /new-asset-name> (before HTML tag close)
            content = content.replace(
                new RegExp(`([/\\\\])${escapeRegex(oldAssetSlug)}(>)`, "g"),
                `$1${newAssetSlug}$2`
            );
            // Fallback: exact full path match (catches anything missed)
            content = content.replaceAll(originalPath, newPath);
        }

        // ── Step 2: Replace asset title in content ──
        if (assetTitle) {
            // Replace <h1> tag
            content = content.replace(/<h1[^>]*>.*?<\/h1>/i, `<h1>${assetTitle}</h1>`);

            // Replace <title> tag
            content = content.replace(/(<title[^>]*>)(.*?)(<\/title>)/i, `$1${assetTitle}$3`);

            // Replace <p><span><strong> patterns (common in EDM templates)
            content = content.replace(
                /(<p[^>]*?>\s*<span[^>]*?>\s*<strong>)(.*?)(<\/strong>)/is,
                `$1${assetTitle}$3`
            );

            // PHP-specific replacements (sendemail.php only)
            if (file === "sendemail.php") {
                // Replace email subject line: $mail->Subject = '... requesting "Old Title"';
                content = content.replace(
                    /(\$mail->Subject\s*=\s*'[^']*?requesting\s*")[^"]+("';)/,
                    `$1${assetTitle}$2`
                );

                // Replace bold title in email body: <b>\"Old Title\"</b>
                content = content.replace(
                    /<b>\\".*?\\"<\/b>/g,
                    `<b>\\"${assetTitle}\\"</b>`
                );

                // Replace any quoted old title: "Old Title"
                const oldTitleFromPath = originalPath.split("/").filter(Boolean).pop().replace(/-/g, " ");
                if (oldTitleFromPath) {
                    const titleRegex = new RegExp(`"${escapeRegex(oldTitleFromPath)}"`, "gi");
                    content = content.replace(titleRegex, `"${assetTitle}"`);
                }
            }
        }

        // ── Step 3: Translate submit button ──
        if (language) {
            const submitText = SUBMIT_TRANSLATIONS[language] || "Submit";
            content = content.replace(/(<button[^>]*?>)(.*?)(<\/button>)/is, `$1${submitText}$3`);
        }

        // Write customized file to asset folder
        await fs.writeFile(dest, content, "utf8");
        console.log(`  ✏️  Customized: ${file}`);
    }
}

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
    const tempFilePath = req.file?.path;

    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const filePath = req.file.path;

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const updatedRows = [];

        // Verify reference folder exists
        const refDir = path.join(OUTPUT_DIR, REF_FOLDER_NAME);
        if (!fs.existsSync(refDir)) {
            return res.status(500).send(
                `Reference folder not found: ${REF_FOLDER_NAME}\n` +
                `Please create it at: ${refDir}\n` +
                `With files: edm.html, index.html, sendemail.php`
            );
        }

        for (const [index, row] of sheet.entries()) {
            const rowNumber = index + 2;

            // Extract fields
            const assetTitle = row["Asset Title / Ad Name"]?.trim();
            const pdfUrlRaw = row["Ungated PDFs of the localized eBooks/reports (include local links for all markets)"]?.trim();
            const formTypeRaw = row["Form Type"]?.trim();
            const countryRaw = row["Market (Must be translated with local Marketo link)"]?.trim();
            const language = row["Language"]?.trim();
            const country = countryRaw?.replace(/\s+/g, "-");

            // Validate
            if (!assetTitle || !pdfUrlRaw || !formTypeRaw || !country || !language) {
                console.warn(`⚠️ Skipping row ${rowNumber}: Missing fields`);
                updatedRows.push({
                    ...row,
                    "Generated URL": "❌ Missing fields"
                });
                continue;
            }

            const formTypeFolder = formTypeRaw.replace(/[^a-zA-Z0-9\-]/g, "").replace(/\s+/g, "-");
            const sanitizedName = sanitizeFilename(assetTitle);

            const assetFolder = path.join(OUTPUT_DIR, formTypeFolder, country, language, sanitizedName);
            await fs.ensureDir(assetFolder);

            // Download PDF
            const filePathPDF = path.join(assetFolder, "asset.pdf");
            const pdfUrl = pdfUrlRaw.startsWith("http") ? pdfUrlRaw : `https://${pdfUrlRaw}`;

            try {
                await downloadPDF(pdfUrl, filePathPDF);
                console.log(`📥 Downloaded: ${assetTitle}`);
            } catch (err) {
                console.error(`❌ PDF failed for "${assetTitle}":`, err.message);
            }

            // Build original & new paths for reference file customization
            const originalPath = path.posix.join("/MSFT/FY26Q4", "Australia", "English", REF_FOLDER_NAME) + "/";
            const newPath = path.posix.join("/MSFT/FY26Q4", country, language, sanitizedName) + "/";

            // Trigger copyReferenceFiles — automatically called for every row
            try {
                console.log(`📋 Copying reference files for: ${assetTitle}`);
                await copyReferenceFiles(refDir, assetFolder, originalPath, newPath, {
                    assetTitle,
                    language,
                });
                console.log(`✅ Reference files created for: ${assetTitle}`);
            } catch (err) {
                console.error(`❌ Reference copy failed for "${assetTitle}":`, err.message);
            }

            // Generate URL
            const generatedURL = `${BASE_URL}/${country}/${language}/${sanitizedName}/`;

            updatedRows.push({
                "Generated URL": generatedURL,
                ...row
            });
        }

        // Create new Excel
        const newSheet = XLSX.utils.json_to_sheet(updatedRows);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

        const outputFile = path.join(__dirname, "Updated_Output.xlsx");
        XLSX.writeFile(newWorkbook, outputFile);

        // Send file to frontend
        res.download(outputFile);

    } catch (error) {
        console.error("❌ ERROR:", error);
        res.status(500).send("Server Error");
    } finally {
        // Cleanup temp file
        if (tempFilePath) {
            try { await fs.remove(tempFilePath); } catch {}
        }
    }
});

// Start server
app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});
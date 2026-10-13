const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// Serve index.html
// --------------------------------------------------

app.use(express.static(__dirname));

// --------------------------------------------------
// Upload config
// --------------------------------------------------

const upload = multer({
    dest: "uploads/"
});

// --------------------------------------------------
// Output folder
// --------------------------------------------------

const OUTPUT_DIR = path.join(__dirname, "downloads");


// --------------------------------------------------
// BASE URL
// --------------------------------------------------

const BASE_URL =
    "https://b2b-insight.biz-tech-insights.com/MSFT/FY25Q4";


// --------------------------------------------------
// Sanitize Name
// --------------------------------------------------

function sanitizeName(value) {

    return String(value || "")
        .trim()

        // Remove apostrophe
        .replace(/['’]/g, "")

        // & -> and
        .replace(/&/g, "and")

        // Anything else -> -
        .replace(/[^a-zA-Z0-9]+/g, "-")

        // Remove starting / ending -
        .replace(/^-+|-+$/g, "");
}


// --------------------------------------------------
// Sanitize Country
// --------------------------------------------------

function sanitizeCountry(value) {

    return String(value || "")
        .trim()
        .replace(/['’]/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


// --------------------------------------------------
// Sanitize Language
// --------------------------------------------------

function sanitizeLanguage(value) {

    return String(value || "")
        .trim()
        .replace(/['’]/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


// --------------------------------------------------
// Convert PDF URL
// --------------------------------------------------

function normalizePdfUrl(url) {

    let finalUrl = String(url || "").trim();

    if (!finalUrl) {
        return "";
    }

    // If URL doesn't have http/https
    if (!/^https?:\/\//i.test(finalUrl)) {

        finalUrl = "https://" + finalUrl;
    }

    return finalUrl;
}


// --------------------------------------------------
// Download PDF
// --------------------------------------------------

async function downloadPDF(url, destination) {

    const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
        timeout: 120000,

        // Some servers require user agent
        headers: {
            "User-Agent":
                "Mozilla/5.0"
        }
    });

    return new Promise((resolve, reject) => {

        const writer =
            fs.createWriteStream(destination);

        response.data.pipe(writer);

        writer.on("finish", resolve);

        writer.on("error", reject);
    });
}


// --------------------------------------------------
// Home
// --------------------------------------------------

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ==================================================
// OLD UPLOAD API
// ==================================================
//
// Keep this if you still need old Excel upload flow.
// ==================================================

app.post(
    "/upload",
    upload.single("file"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res
                    .status(400)
                    .send("No file uploaded");

            }

            console.log(
                "📂 Uploaded file:",
                req.file.originalname
            );

            res.json({
                success: true,
                message: "Excel uploaded successfully"
            });

        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );

            res
                .status(500)
                .send("Server Error");

        }

    }
);


// ==================================================
// GENERATE ASSETS
// ==================================================

app.post(
    "/generate",
    async (req, res) => {

        try {

            console.log("\n=================================");
            console.log("🚀 GENERATE REQUEST RECEIVED");
            console.log("=================================\n");


            // ------------------------------------------
            // Get assets from frontend
            // ------------------------------------------

            const assets = req.body.assets;


            if (!Array.isArray(assets)) {

                console.error(
                    "❌ assets is not an array"
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid assets data"

                });

            }


            if (assets.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No assets found"

                });

            }


            console.log(
                `📦 Total assets received: ${assets.length}`
            );


            // ------------------------------------------
            // Create downloads folder
            // ------------------------------------------

            await fs.ensureDir(
                OUTPUT_DIR
            );


            const results = [];

            let successCount = 0;
            let failedCount = 0;


            // ------------------------------------------
            // Process every asset
            // ------------------------------------------

            for (
                let i = 0;
                i < assets.length;
                i++
            ) {

                const item = assets[i];


                const assetTitle =
                    String(
                        item.assetTitle || ""
                    ).trim();


                const country =
                    String(
                        item.country || ""
                    ).trim();


                const language =
                    String(
                        item.language || ""
                    ).trim();


                const pdf =
                    String(
                        item.pdf || ""
                    ).trim();


                console.log(
                    `\n[${i + 1}/${assets.length}]`
                );

                console.log(
                    "Asset:",
                    assetTitle
                );

                console.log(
                    "Country:",
                    country
                );

                console.log(
                    "Language:",
                    language
                );

                console.log(
                    "PDF:",
                    pdf
                );


                // --------------------------------------
                // Validate
                // --------------------------------------

                if (
                    !assetTitle ||
                    !country ||
                    !language ||
                    !pdf
                ) {

                    console.warn(
                        "⚠️ Missing information - skipped"
                    );

                    failedCount++;

                    results.push({

                        assetTitle,
                        country,
                        language,

                        status:
                            "failed",

                        message:
                            "Missing information"

                    });

                    continue;
                }


                // --------------------------------------
                // Sanitize names
                // --------------------------------------

                const countryFolder =
                    sanitizeCountry(
                        country
                    );


                const languageFolder =
                    sanitizeLanguage(
                        language
                    );


                const assetFolderName =
                    sanitizeName(
                        assetTitle
                    );


                // --------------------------------------
                // Folder structure
                //
                // downloads
                //   └── Bahrain
                //       └── Arabic
                //           └── Agentic-AI-is-Here-Secure-It-Now
                //               └── asset.pdf
                //
                // --------------------------------------

                const assetFolder =
                    path.join(

                        OUTPUT_DIR,

                        countryFolder,

                        languageFolder,

                        assetFolderName

                    );


                await fs.ensureDir(
                    assetFolder
                );


                // --------------------------------------
                // PDF path
                // --------------------------------------

                const pdfFilePath =
                    path.join(

                        assetFolder,

                        "asset.pdf"

                    );


                // --------------------------------------
                // PDF URL
                // --------------------------------------

                const pdfUrl =
                    normalizePdfUrl(
                        pdf
                    );


                console.log(
                    "⬇️ Downloading PDF..."
                );


                // --------------------------------------
                // Download PDF
                // --------------------------------------

                try {

                    await downloadPDF(

                        pdfUrl,

                        pdfFilePath

                    );


                    console.log(
                        "✅ PDF downloaded"
                    );


                } catch (downloadError) {

                    console.error(
                        "❌ PDF download failed:",
                        downloadError.message
                    );


                    failedCount++;


                    results.push({

                        assetTitle,

                        country,

                        language,

                        status:
                            "failed",

                        message:
                            downloadError.message

                    });


                    continue;
                }


                // --------------------------------------
                // Generated URL
                // --------------------------------------

                const generatedURL =
                    `${BASE_URL}/${countryFolder}/${languageFolder}/${assetFolderName}/`;


                console.log(
                    "🔗 Generated URL:",
                    generatedURL
                );


                // --------------------------------------
                // Success
                // --------------------------------------

                successCount++;


                results.push({

                    assetTitle,

                    country,

                    language,

                    pdf,

                    generatedURL,

                    status:
                        "success"

                });

            }


            // ------------------------------------------
            // Final response
            // ------------------------------------------

            console.log("\n=================================");
            console.log("🎉 GENERATION COMPLETED");
            console.log("=================================");

            console.log(
                "Total:",
                assets.length
            );

            console.log(
                "Success:",
                successCount
            );

            console.log(
                "Failed:",
                failedCount
            );


            res.json({

                success:
                    true,

                message:
                    "Assets generated successfully",

                total:
                    assets.length,

                successCount:
                    successCount,

                failedCount:
                    failedCount,

                results:
                    results

            });


        } catch (error) {

            console.error(
                "\n❌ GENERATE ERROR:"
            );

            console.error(
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Asset generation failed",

                error:
                    error.message

            });

        }

    }
);


// ==================================================
// Start Server
// ==================================================

app.listen(
    3000,
    () => {

        console.log(
            "\n🚀 Server running at:"
        );

        console.log(
            "http://localhost:3000"
        );

        console.log(
            "\n📁 Assets will be created inside:"
        );

        console.log(
            OUTPUT_DIR
        );

    }
);
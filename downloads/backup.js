const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');


// Config
const EXCEL_PATH = './Activate_Security CS_FY25_Content Syndication Submission_C1Q4.xlsx';
const OUTPUT_DIR = path.join(__dirname, 'downloads');
const REF_FOLDER_NAME = '3-Reasons-to-Adopt-Consolidated-Security-demo';
const BASE_URL = 'https://b2b-insight.biz-tech-insights.com/MSFT/FY25Q4';

// Utilities
function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

async function downloadPDF(url, destination) {
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destination);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function fetchLandingPageContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // ✅ Extract structured content preserving HTML (e.g., <br />, <strong>)
    const landingContent = {
      h1: $('h1').first().html() || '',
      p1: $('p').eq(0).html() || '',
      p2: $('p').eq(1).html() || '',
      ul: $('ul').first().html() || ''
    };

    return landingContent;

  } catch (error) {
    console.error(`❌ Error fetching URL (${url}):`, error.message);

    // Return empty structure on error
    return {
      h1: '',
      p1: '',
      p2: '',
      ul: ''
    };
  }
}



async function copyReferenceFiles(refDir, assetFolder, originalPath, newPath, replacements = {}) {
  const filesToCopy = ['edm.html', 'emdsendemail.php', 'index.html'];

  for (const file of filesToCopy) {
    const src = path.join(refDir, file);
    const dest = path.join(assetFolder, file);

    // Check if the source file exists
    if (!fs.existsSync(src)) {
      throw new Error(`Missing reference file: ${file}`);
    }

    let content = await fs.readFile(src, 'utf8');

    // Replace asset path
    content = content.replaceAll(originalPath, newPath);

    /** -------------------------------
     /* Replace H1 and related elements
     * ------------------------------- */
    if (replacements.h1) {
      // Replace <h1>
      content = content.replace(/<h1>.*?<\/h1>/i, `<h1>${replacements.h1}</h1>`);

      // Replace inside <title>
      content = content.replace(/(<title[^>]*>)(.*?)(<\/title>)/i, `$1${replacements.h1}$3`);

      // Replace content inside <strong> tag within styled <p>
      content = content.replace(
        /(<p[^>]*?>\s*<span[^>]*?>\s*<strong>)(.*?)(<\/strong>)/is,
        `$1${replacements.h1}$3`
      );
    }

    /** ----------------------------
     * Replace or Insert <ul> block
     * ---------------------------- */

    content = content.replace(/<ul>.*?<\/ul>/is, `<ul>${replacements.ul}</ul>`);


    

if (replacements.ul) {
  const ulMatch = content.match(/<ul[\s\S]*?<\/ul>/i);
  if (ulMatch) {
    // Replace the existing <ul> block
    content = content.replace(ulMatch[0], `<ul>${replacements.ul}</ul>`);
  } else {
    // Insert <ul> only if valid
    content = content.replace(/(<\/p>\s*)(?![\s\S]*<\/p>)/i, `$1<ul>${replacements.ul}</ul>\n`);
  }
} else {
  // Remove <ul> block if present and no valid content
  content = content.replace(/<ul[\s\S]*?<\/ul>/i, '');
}





    /** -----------------------------------
     * Replace or Insert First Two <p> Tags
     * ----------------------------------- */
// Remove HTML comments before analyzing <p> tags
const cleanedContent = content.replace(/<!--[\s\S]*?-->/g, '');
const pMatches = [...cleanedContent.matchAll(/<p>.*?<\/p>/ig)];

// Only use valid values; fallback to empty string
const p1 = typeof replacements.p1 === 'string' ? replacements.p1 : '';
const p2 = typeof replacements.p2 === 'string' ? replacements.p2 : '';

if (pMatches.length >= 2) {
  // Replace first two <p> tags only if we have valid content
  content = content.replace(pMatches[0][0], `<p>${p1}</p>`);
  content = content.replace(pMatches[1][0], `<p>${p2}</p>`);
} else {
  // Construct new paragraphs if fewer <p> exist
  const insertP = [];
  if (p1) insertP.push(`<p>${p1}</p>`);
  if (p2) insertP.push(`<p>${p2}</p>`);

  if (/<h1>.*?<\/h1>/i.test(content)) {
    content = content.replace(/<h1>.*?<\/h1>/i, match => {
      return `${match}\n${insertP.join('\n')}`;
    });
  } else if (/<ul>/i.test(content)) {
    content = content.replace(/<ul>/i, `${insertP.join('\n')}\n<ul>`);
  } else {
    content = `${insertP.join('\n')}\n${content}`;
  }
}

const submitTranslations = {
  English: "Submit",
  French: "Soumettre",
  German: "Einreichen",
  Japanese: "送信する",
  Spanish: "Enviar",
  Chinese: "提交",
  // Add more as needed
};

// Dynamically replace Submit button text based on language
if (replacements.language) {
  const submitText = submitTranslations[replacements.language] || 'Submit';
  content = content.replace(
    /(<button[^>]*?>)(.*?)(<\/button>)/is,
    `$1${submitText}$3`
  );
}




    // Write updated content to destination
    await fs.writeFile(dest, content, 'utf8');
  }
}




async function main() {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const updatedRows = [];

  for (const [index, row] of sheet.entries()) {
    const assetTitle = row['Asset Title / Ad Name']?.trim();
    const pdfUrlRaw = row['Ungated PDFs of the localized eBooks/reports (include local links for all markets)']?.trim();
    const formTypeRaw = row['Form Type']?.trim();
    const countryRaw = row['Market (Must be translated with local Marketo link)']?.trim();
    const country = countryRaw?.replace(/\s+/g, '-');
    const language = row['Language']?.trim();
    const landingUrl = row['Marketo Landing Page (include local links for all markets)']?.trim();

    if (!assetTitle || !pdfUrlRaw || !formTypeRaw || !country || !language) {
      console.warn(`⚠️ Skipping row ${index + 2}: Missing required fields`);
      updatedRows.push({ ...row, 'Generated URL': '❌ Missing required fields' });
      continue;
    }

    const formTypeFolder = formTypeRaw.replace(/[^a-zA-Z0-9\-]/g, '').replace(/\s+/g, '-');
    const sanitizedName = sanitizeFilename(assetTitle);

    const baseFolder = path.join(OUTPUT_DIR, formTypeFolder, country, language);
    const assetFolder = path.join(baseFolder, sanitizedName);
    await fs.ensureDir(assetFolder);



    const landingContent = await fetchLandingPageContent(landingUrl);

    



    // Save PDF
    const filePath = path.join(assetFolder, 'asset.pdf');
    const pdfUrl = pdfUrlRaw.startsWith('http') ? pdfUrlRaw : `https://${pdfUrlRaw}`;
    try {
      await downloadPDF(pdfUrl, filePath);
      console.log(`📥 PDF saved: ${filePath}`);
    } catch (err) {
      console.error(`❌ Failed to download PDF for "${assetTitle}":`, err.message);
    }

    // Replace path inside files
    const refDir = path.join(OUTPUT_DIR, REF_FOLDER_NAME);
    const originalPath = path.posix.join('/MSFT/FY25Q4', 'Australia', 'English', REF_FOLDER_NAME) + '/';
    const newPath = path.posix.join('/MSFT/FY25Q4', country, language, sanitizedName) + '/';

    try {
  await copyReferenceFiles(refDir, assetFolder, originalPath, newPath, {
  ...landingContent,
  language, // Make sure this is passed so the function can localize
});
      console.log(`✅ Reference files cloned for: ${assetTitle}`);
    } catch (err) {
      console.error(`❌ Error copying reference files for "${assetTitle}":`, err.message);
    }

    const generatedURL = `${BASE_URL}/${country}/${language}/${sanitizedName}/`;
    updatedRows.push({ 'Generated URL': generatedURL, ...row });
  }

  // Save new Excel file with Generated URL column
  const newSheet = XLSX.utils.json_to_sheet(updatedRows);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
  XLSX.writeFile(newWorkbook, './Updated_Content_Syndication_With_URL.xlsx');

  console.log('✅ All done. Output written to "Updated_Content_Syndication_With_URL.xlsx"');
}

main().catch(console.error);

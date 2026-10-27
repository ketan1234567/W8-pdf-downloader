
const ftp = require("basic-ftp");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const LOCAL_TEMPLATES_DIR = path.join(__dirname, "templates");
const FTP_ROOT = process.env.FTP_ROOT || "/MSFT/FY27Q2";

const REQUIRED_FILES = [
  "index.html",
  "edm.html",
  "sendemail.php",
  
];

function sanitizeName(value) {
  return String(value || "")
    .trim()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function joinRemote(...parts) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");
}

function isDirectory(item) {
  return item.type === 2;
}

function isFile(item) {
  return item.type === 1;
}

function getModifiedTime(item) {
  const value = item.modifiedAt;
  return value instanceof Date && !Number.isNaN(value.getTime())
    ? value.getTime()
    : 0;
}

async function listDirectories(client, remotePath) {
  const entries = await client.list(remotePath);
  return entries.filter(
    (item) =>
      isDirectory(item) &&
      item.name !== "." &&
      item.name !== ".."
  );
}

async function findLatestAssetFolder(client, localePath) {
  const assetFolders = await listDirectories(client, localePath);

  const eligibleFolders = [];

  for (const folder of assetFolders) {
    const folderPath = joinRemote(localePath, folder.name);

    try {
      const files = await client.list(folderPath);
      const fileNames = files
        .filter(isFile)
        .map((file) => file.name.toLowerCase());

      const hasIndex = fileNames.includes("index.html");
      const hasEmail =
        fileNames.includes("edm.html") ||
        fileNames.includes("email.html");
      const hasPhp = fileNames.includes("sendemail.php");

      if (hasIndex && hasEmail && hasPhp) {
        eligibleFolders.push({
          name: folder.name,
          path: folderPath,
          modifiedAt: getModifiedTime(folder),
        });
      }
    } catch (error) {
      console.warn(
        `Skipping remote folder ${folderPath}: ${error.message}`
      );
    }
  }

  eligibleFolders.sort(
    (a, b) => b.modifiedAt - a.modifiedAt
  );

  return eligibleFolders[0] || null;
}


async function downloadRequiredFiles(
  client,
  remoteAssetPath,
  localAssetPath
) {
  const remoteFiles = await client.list(remoteAssetPath);

  const availableNames = new Map(
    remoteFiles
      .filter(isFile)
      .map((file) => [file.name.toLowerCase(), file.name])
  );

  const filesToDownload = [
    "index.html",
    availableNames.has("edm.html") ? "edm.html" : "email.html",
    "sendemail.php",
  ];

  // Find available thank-you HTML files
  const thankYouFiles = [...availableNames.keys()].filter(
    (name) =>
      /^thanks\.html$/i.test(name) ||
      /^thankyou(?:_\d+)?\.html$/i.test(name)
  );

  filesToDownload.push(...thankYouFiles);

  await fs.ensureDir(localAssetPath);

  for (const requiredFile of filesToDownload) {
    const actualName = availableNames.get(
      requiredFile.toLowerCase()
    );

    if (!actualName) {
      throw new Error(
        `Missing ${requiredFile} in ${remoteAssetPath}`
      );
    }

    const remoteFilePath = joinRemote(
      remoteAssetPath,
      actualName
    );

    const localFilePath = path.join(
      localAssetPath,
      actualName
    );

    await client.downloadTo(localFilePath, remoteFilePath);

    console.log(`Downloaded: ${localFilePath}`);
  }
}



async function processLanguage(client, countryFolder, languageFolder) {
  const remoteLanguagePath = joinRemote(
    FTP_ROOT,
    countryFolder,
    languageFolder
  );

  console.log(`\nFTP path: ${remoteLanguagePath}`);

  let latestAsset;

  try {
    // Find the latest eligible folder directly under the language path
    latestAsset = await findLatestAssetFolder(
      client,
      remoteLanguagePath
    );
  } catch (error) {
    console.warn(`FTP path not found: ${remoteLanguagePath}`);
    console.warn(error.message);
    return;
  }

  if (!latestAsset) {
    console.warn(
      `No eligible asset folder found: ${remoteLanguagePath}`
    );
    return;
  }

  const localAssetPath = path.join(
    LOCAL_TEMPLATES_DIR,
    countryFolder,
    languageFolder,
    "1"
  );

  //console.log(`Latest folder: ${latestAsset.name}`);
  console.log(`Remote folder: ${latestAsset.path}`);

  await downloadRequiredFiles(
    client,
    latestAsset.path,
    localAssetPath
  );

  console.log(`Saved to: ${localAssetPath}`);
}






async function main() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = true;

  try {
    if (
      !process.env.FTP_HOST ||
      !process.env.FTP_USER ||
      !process.env.FTP_PASSWORD
    ) {
      throw new Error(
        "FTP_HOST, FTP_USER and FTP_PASSWORD must be set in .env"
      );
    }

    await client.access({
      host: process.env.FTP_HOST,
      port: Number(process.env.FTP_PORT || 21),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === "true",
    });

    console.log("FTP connected successfully.");

    // Step 1: Read all country-language combinations
    const countryEntries = await fs.readdir(
      LOCAL_TEMPLATES_DIR,
      { withFileTypes: true }
    );

    const countries = countryEntries.filter(
      (entry) => entry.isDirectory()
    );

    const tasks = [];

    for (const countryEntry of countries) {
      const countryFolder = countryEntry.name;

      const countryPath = path.join(
        LOCAL_TEMPLATES_DIR,
        countryFolder
      );

      const languageEntries = await fs.readdir(
        countryPath,
        { withFileTypes: true }
      );

      const languages = languageEntries.filter(
        (entry) => entry.isDirectory()
      );

      for (const languageEntry of languages) {
        tasks.push({
          countryFolder,
          languageFolder: languageEntry.name,
        });
      }
    }

    const total = tasks.length;

    console.log("\nStarting template download...\n");
    console.log(`Total country-language combinations: ${total}\n`);

    // Step 2: Process each combination sequentially
    let completed = 0;
    let failed = 0;

    for (const task of tasks) {
      const { countryFolder, languageFolder } = task;
      const current = completed + failed + 1;

      console.log(
        `\n[${current}/${total}] ${countryFolder} - ${languageFolder}`
      );

      try {
        await processLanguage(
          client,
          countryFolder,
          languageFolder
        );

        completed++;

        console.log(
          `[${current}/${total}] ${countryFolder} - ${languageFolder}: Download process completed`
        );
      } catch (error) {
        failed++;

        console.error(
          `[${current}/${total}] ${countryFolder} - ${languageFolder}: FAILED - ${error.message}`
        );
      }
    }

    console.log("\n====================================");
    console.log("Template download process completed.");
    console.log(`Total combinations: ${total}`);
    console.log(`Completed: ${completed}`);
    console.log(`Failed: ${failed}`);
    console.log("====================================");
  } catch (error) {
    console.error("Downloader error:", error.message);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();

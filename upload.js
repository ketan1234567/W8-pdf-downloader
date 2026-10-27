
const ftp = require("basic-ftp");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const LOCAL_DOWNLOADS_DIR = path.join(__dirname, "downloads");
const FTP_ROOT = process.env.FTP_ROOT || "/MSFT/FY27Q2";

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

async function getDirectories(localPath) {
  const entries = await fs.readdir(localPath, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}


async function uploadAsset(
  client,
  country,
  language,
  assetName
) {
  const localAssetPath = path.join(
    LOCAL_DOWNLOADS_DIR,
    country,
    language,
    assetName
  );

  const remoteLocalePath = joinRemote(
    FTP_ROOT,
    country,
    language
  );

  const remoteAssetPath = joinRemote(
    remoteLocalePath,
    assetName
  );

  // Check local asset folder.
  if (!(await fs.pathExists(localAssetPath))) {
    throw new Error(
      `Local asset folder not found: ${localAssetPath}`
    );
  }

  // Ensure the remote locale folder exists.
  await client.ensureDir(remoteLocalePath);

  // Check whether the asset folder already exists.
  const remoteEntries = await client.list(remoteLocalePath);

  const existingAsset = remoteEntries.find(
    (entry) =>
      isDirectory(entry) &&
      entry.name.toLowerCase() === assetName.toLowerCase()
  );

  if (existingAsset) {
    throw new Error(
      `Asset folder already exists on FTP: ${remoteAssetPath}\n` +
      `Please change the asset folder name before uploading.`
    );
  }

  // Create the destination asset folder.
  await client.ensureDir(remoteAssetPath);

  // Upload files into the correct remote asset folder.
  await client.uploadFromDir(localAssetPath);

  console.log(`SUCCESS: ${assetName} uploaded successfully.`);
  console.log(`Remote path: ${remoteAssetPath}`);
}



async function main() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = false;

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

    if (!(await fs.pathExists(LOCAL_DOWNLOADS_DIR))) {
      throw new Error(
        `Downloads folder not found: ${LOCAL_DOWNLOADS_DIR}`
      );
    }

    console.log("Connecting to FTP...");

    await client.access({
      host: process.env.FTP_HOST,
      port: Number(process.env.FTP_PORT || 21),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === "true",
    });

    console.log("FTP connected successfully.");

    // Read all country-language-locale-asset combinations.
    const tasks = [];

    const countries = await getDirectories(LOCAL_DOWNLOADS_DIR);


for (const country of countries) {
  const countryPath = path.join(
    LOCAL_DOWNLOADS_DIR,
    country
  );

  const languages = await getDirectories(countryPath);

  for (const language of languages) {
    const languagePath = path.join(
      countryPath,
      language
    );

    const assets = await getDirectories(languagePath);

    for (const assetName of assets) {
      tasks.push({
        country,
        language,
        assetName,
      });
    }
  }
}


    const total = tasks.length;

    if (total === 0) {
      console.log("No asset folders found in downloads.");
      return;
    }

    console.log("\nStarting template upload...\n");
    console.log(`Total assets: ${total}\n`);

    let uploaded = 0;
    let alreadyExisted = 0;

    // Process each asset sequentially.
    for (let i = 0; i < total; i++) {
      const task = tasks[i];

      console.log(
        `\n[${i + 1}/${total}] ` +
        `${task.country} - ${task.language} - ${task.localeCode}`
      );

      console.log(`Asset: ${task.assetName}`);

      try {
        await uploadAsset(
          client,
          task.country,
          task.language,
          task.assetName
        );

        uploaded++;

      } catch (error) {
        if (
          error.message.includes(
            "Asset folder already exists on FTP:"
          )
        ) {
          alreadyExisted++;

          console.log(
            `ALREADY EXISTS: ${task.assetName}`
          );
          console.log(
            "Skipping this asset. Checking next asset..."
          );

          continue;
        }

        console.error(
          `UPLOAD FAILED: ${task.assetName}`
        );
        console.error(error.message);

        console.error(
          "Upload process stopped due to an error."
        );

        process.exitCode = 1;
        return;
      }
    }

    console.log("\n====================================");
    console.log("Template upload process completed.");
    console.log(`Total assets: ${total}`);
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Already existed: ${alreadyExisted}`);
    console.log("Failed: 0");
    console.log("====================================");

  } catch (error) {
    console.error("\nUploader error:", error.message);
    process.exitCode = 1;

  } finally {
    client.close();
  }
}

main();




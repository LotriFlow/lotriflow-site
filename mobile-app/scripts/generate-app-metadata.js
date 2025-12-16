const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "..", "package.json");
const metadataPath = path.join(__dirname, "..", "src", "app-metadata.js");

if (!fs.existsSync(packageJsonPath)) {
  throw new Error("package.json not found when generating app metadata");
}

const pkg = require(packageJsonPath);
const defaultVersion = pkg.version || "1.0.0";
const defaultBuild =
  process.env.APP_BUILD_NUMBER || pkg.buildNumber || pkg.build || "1";

function parsePbxVersionInfo() {
  const pbxPath = path.join(
    __dirname,
    "..",
    "ios",
    "App",
    "App.xcodeproj",
    "project.pbxproj"
  );

  if (!fs.existsSync(pbxPath)) {
    return null;
  }

  const contents = fs.readFileSync(pbxPath, "utf8");
  const releaseBlockPattern = /[0-9A-Z]+ \/\* Release \*\/ = \{([\s\S]+?)\};/g;
  let match;

  while ((match = releaseBlockPattern.exec(contents))) {
    const block = match[0];
    if (!block.includes("App/Info.plist")) continue;

    const marketingMatch = block.match(/MARKETING_VERSION = ([^;]+);/);
    const projectVersionMatch = block.match(
      /CURRENT_PROJECT_VERSION = ([^;]+);/
    );

    const version = marketingMatch?.[1]?.trim();
    const build = projectVersionMatch?.[1]?.trim();

    if (version || build) {
      return { version, build };
    }
  }

  return null;
}

const pbxMetadata = parsePbxVersionInfo();
const metadata = {
  version: pbxMetadata?.version || defaultVersion,
  build: pbxMetadata?.build || defaultBuild,
};

const output = `window.__APP_METADATA__ = ${JSON.stringify(metadata)};\n`;

fs.writeFileSync(metadataPath, output, "utf8");
console.log(`Generated ${path.relative(process.cwd(), metadataPath)} ->`, metadata);

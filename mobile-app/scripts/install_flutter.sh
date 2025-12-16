#!/bin/zsh
# Flutter installation script for macOS

set -e

# 1. Download Flutter SDK
echo "Downloading Flutter SDK..."
cd ~
mkdir -p development
cd development
curl -L -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_latest.zip

# 2. Extract the zip file
echo "Extracting Flutter SDK..."
unzip -q flutter_macos_arm64_latest.zip

# 3. Add Flutter to PATH if not already present
if ! grep -q 'export PATH="$PATH:$HOME/development/flutter/bin"' ~/.zshrc; then
  echo '\n# Add Flutter to PATH' >> ~/.zshrc
  echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.zshrc
  echo "Added Flutter to PATH in ~/.zshrc"
else
  echo "Flutter path already in ~/.zshrc"
fi

# 4. Source ~/.zshrc to update PATH for this session
echo "Updating PATH for current session..."
export PATH="$PATH:$HOME/development/flutter/bin"

# 5. Run flutter doctor
echo "Running flutter doctor..."
flutter doctor

echo "Flutter installation complete! Please restart your terminal if you want PATH changes to persist."

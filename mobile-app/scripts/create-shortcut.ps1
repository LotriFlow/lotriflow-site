# This script creates a desktop shortcut to launch the LotriFlow Quit PWA.

# --- Configuration ---
$AppName = "LotriFlow Quit"
$AppURL = "http://localhost:8080"
$ProjectDir = $PSScriptRoot # The directory where this script is located
$IconPath = Join-Path $ProjectDir "icon-512x512.png"

# --- Find Microsoft Edge ---
$EdgePath1 = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
$EdgePath2 = "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe"
$EdgePath = ""

if (Test-Path $EdgePath1) {
    $EdgePath = $EdgePath1
} elseif (Test-Path $EdgePath2) {
    $EdgePath = $EdgePath2
} else {
    Write-Error "Microsoft Edge not found. Please install it."
    # Pause to allow user to read the error
    Read-Host "Press Enter to exit"
    exit
}

# --- Create the Shortcut ---
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "$AppName.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell

$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $EdgePath
# Use --app mode to launch as a PWA-like window
$Shortcut.Arguments = "--app=$AppURL"
$Shortcut.IconLocation = $IconPath
$Shortcut.Description = "Launch the LotriFlow Quit App"
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.Save()

# --- Finish ---
Write-Host "✅ Success!"
Write-Host "A shortcut named '$AppName' has been created on your Desktop."
Write-Host "You can now use that shortcut to start the application."
Write-Host ""
# Pause to allow user to read the message
Read-Host "Press Enter to close this window"

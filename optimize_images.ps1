[CmdletBinding()]
param(
    [string]$SourceDirectory = $PWD,
    [string]$OutputDirectory = (Join-Path $SourceDirectory "dist")
)

Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$InputFile,
        [string]$OutputFile,
        [int]$Width,
        [int]$Height
    )

    $srcImage = $null
    $newImage = $null
    $graphics = $null

    try {
        $srcImage = [System.Drawing.Image]::FromFile($InputFile)

        $newWidth = $Width
        $newHeight = $Height

        $newImage = New-Object System.Drawing.Bitmap $newWidth, $newHeight
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)

        # Set high-quality interpolation and rendering settings
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $graphics.DrawImage($srcImage, 0, 0, $newWidth, $newHeight)

        # Ensure output directory exists
        $outputDir = Split-Path -Path $OutputFile -Parent
        if (-not (Test-Path -Path $outputDir)) {
            New-Item -Path $outputDir -ItemType Directory | Out-Null
        }

        $newImage.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)

        Write-Host "Created $OutputFile"
    }
    finally {
        # Ensure all GDI+ objects are disposed of, even if errors occur
        if ($graphics -ne $null) { $graphics.Dispose() }
        if ($newImage -ne $null) { $newImage.Dispose() }
        if ($srcImage -ne $null) { $srcImage.Dispose() }
    }
}

function Resize-ImageWithAspectRatio {
    param(
        [string]$InputFile,
        [string]$OutputFile,
        [int]$MaxWidth,
        [int]$MaxHeight
    )

    $srcImage = [System.Drawing.Image]::FromFile($InputFile)
    try {
        $ratioX = $MaxWidth / $srcImage.Width
        $ratioY = $MaxHeight / $srcImage.Height
        $ratio = [Math]::Min($ratioX, $ratioY)

        $newWidth = [int]($srcImage.Width * $ratio)
        $newHeight = [int]($srcImage.Height * $ratio)

        # Call the base resize function
        Resize-Image -InputFile $InputFile -OutputFile $OutputFile -Width $newWidth -Height $newHeight
    }
    finally {
        if ($srcImage -ne $null) { $srcImage.Dispose() }
    }
}

# --- Main Script Logic ---

Write-Host "Starting image optimization..."
Write-Host "Source directory: $SourceDirectory"
Write-Host "Output directory: $OutputDirectory"

# Process LOGO.png (square, no aspect ratio maintained)
$logoPath = Join-Path $SourceDirectory "LOGO.png"
if (Test-Path $logoPath) {
    Resize-Image -InputFile $logoPath -OutputFile (Join-Path $OutputDirectory "logo-brand.png") -Width 512 -Height 512
    Resize-Image -InputFile $logoPath -OutputFile (Join-Path $OutputDirectory "favicon.png") -Width 32 -Height 32
    Resize-Image -InputFile $logoPath -OutputFile (Join-Path $OutputDirectory "apple-touch-icon.png") -Width 180 -Height 180
}
else {
    Write-Warning "LOGO.png not found in $SourceDirectory. Skipping."
}

# Process NAME.png (maintain aspect ratio)
$namePath = Join-Path $SourceDirectory "NAME.png"
if (Test-Path $namePath) {
    # Resize to a max height of 100px, width will scale automatically.
    Resize-ImageWithAspectRatio -InputFile $namePath -OutputFile (Join-Path $OutputDirectory "logo-text.png") -MaxWidth 2000 -MaxHeight 100
}
else {
    Write-Warning "NAME.png not found in $SourceDirectory. Skipping."
}

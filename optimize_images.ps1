Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$InputFile,
        [string]$OutputFile,
        [int]$Width,
        [int]$Height,
        [bool]$MaintainAspect = $false
    )

    $srcImage = [System.Drawing.Image]::FromFile($InputFile)
    
    if ($MaintainAspect) {
        $ratioX = $Width / $srcImage.Width
        $ratioY = $Height / $srcImage.Height
        $ratio = if ($ratioX -lt $ratioY) { $ratioX } else { $ratioY }
        
        $newWidth = [int]($srcImage.Width * $ratio)
        $newHeight = [int]($srcImage.Height * $ratio)
    } else {
        $newWidth = $Width
        $newHeight = $Height
    }

    $newImage = new-object System.Drawing.Bitmap $newWidth, $newHeight
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImage, 0, 0, $newWidth, $newHeight)
    
    $newImage.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $newImage.Dispose()
    $srcImage.Dispose()
    
    Write-Host "Created $OutputFile"
}

# Process LOGO.png
$logoPath = Join-Path $PWD "LOGO.png"
if (Test-Path $logoPath) {
    Resize-Image -InputFile $logoPath -OutputFile (Join-Path $PWD "logo-brand.png") -Width 512 -Height 512
    Resize-Image -InputFile $logoPath -OutputFile (Join-Path $PWD "favicon.png") -Width 32 -Height 32
    Resize-Image -InputFile $logoPath -OutputFile (Join-Path $PWD "apple-touch-icon.png") -Width 180 -Height 180
} else {
    Write-Error "LOGO.png not found!"
}

# Process NAME.png
$namePath = Join-Path $PWD "NAME.png"
if (Test-Path $namePath) {
    # Resize to height 100px, maintain aspect ratio (width will be calculated)
    # We pass a large width to ensure height is the limiting factor
    Resize-Image -InputFile $namePath -OutputFile (Join-Path $PWD "logo-text.png") -Width 2000 -Height 100 -MaintainAspect $true
} else {
    Write-Error "NAME.png not found!"
}

# Generate-PhotosManifest.ps1
# Scans Images\Photos\<GigFolder>\*.jpg and generates photos-manifest.js
# Run by right-click > Run with PowerShell

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$photosPath = Join-Path $root "images\photos"
$outFile = Join-Path $root "photos-manifest.js"

if (!(Test-Path $photosPath)) {
    Write-Host "ERROR: Folder not found: $photosPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# All gig folders (direct children)
$gigFolders = Get-ChildItem -Path $photosPath -Directory | Sort-Object Name

# Helper: get ddmmyyyy at end of folder
function Get-DateSuffix($name) {
    if ($name -match '(\d{2})(\d{2})(\d{4})$') {
        return "$($matches[3])$($matches[2])$($matches[1])"  # yyyymmdd
    }
    return "00000000"
}

# Sort newest gig first (by date suffix)
$gigFolders = $gigFolders | Sort-Object @{ Expression = { Get-DateSuffix $_.Name }; Descending = $true }, Name

$entries = @()

foreach ($folder in $gigFolders) {
    $jpgs = Get-ChildItem -Path $folder.FullName -File |
        Where-Object { $_.Extension -match '\.(jpg|jpeg)$' } |
        Sort-Object Name

    if ($jpgs.Count -eq 0) {
        continue
    }

    $imageList = $jpgs | ForEach-Object { $_.Name }

    $entries += [PSCustomObject]@{
        folder = $folder.Name
        images = $imageList
    }
}

# Build JS output
$lines = @()
$lines += "// photos-manifest.js"
$lines += "// AUTO-GENERATED - do not edit by hand"
$lines += "// Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "// Source: Images/Photos/<GigFolder>/*.jpg"
$lines += ""
$lines += "window.FLIPSIDE_PHOTOS = ["

for ($i = 0; $i -lt $entries.Count; $i++) {
    $e = $entries[$i]

    $lines += "  {"
    $lines += "    folder: ""$($e.folder)"","
    $lines += "    images: ["

    for ($j = 0; $j -lt $e.images.Count; $j++) {
        $comma = ""
        if ($j -lt ($e.images.Count - 1)) { $comma = "," }
        $lines += "      ""$($e.images[$j])""$comma"
    }

    $lines += "    ]"
    $lines += "  }" + ($(if ($i -lt ($entries.Count - 1)) { "," } else { "" }))
}

$lines += "];"
$lines += ""

Set-Content -Path $outFile -Value $lines -Encoding UTF8

Write-Host ""
Write-Host "SUCCESS: Created photos-manifest.js" -ForegroundColor Green
Write-Host " -> $outFile"
Write-Host "Gigs found: $($entries.Count)"
Write-Host ""
Read-Host "Press Enter to exit"

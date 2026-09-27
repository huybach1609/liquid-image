# PowerShell Script to register Sparse Package for Windows 11 Top-Level Context Menu
# Run from the application directory containing AppxManifest.xml and liquid-image.exe

param(
    [string]$AppDir = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

Write-Host "Registering Liquid Image Sparse Package for Windows 11..." -ForegroundColor Cyan

$ManifestPath = Join-Path $AppDir "AppxManifest.xml"
if (-not (Test-Path $ManifestPath)) {
    Write-Error "AppxManifest.xml not found at: $ManifestPath"
    exit 1
}

try {
    # Register unpackaged app with package identity
    Add-AppxPackage -Register $ManifestPath -AllowExternalLocation
    Write-Host "Successfully registered Sparse Package! Windows 11 Modern Context Menu is now active." -ForegroundColor Green
}
catch {
    Write-Error "Failed to register Sparse Package: $_"
    exit 1
}

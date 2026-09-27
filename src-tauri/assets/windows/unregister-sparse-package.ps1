# PowerShell Script to unregister Sparse Package for Liquid Image

param(
    [string]$PackageName = "vn.io.weback1609.liquid-image"
)

$ErrorActionPreference = "Continue"

Write-Host "Unregistering Liquid Image Sparse Package..." -ForegroundColor Cyan

$pkg = Get-AppxPackage -Name $PackageName
if ($pkg) {
    Remove-AppxPackage -Package $pkg.PackageFullName
    Write-Host "Successfully removed Sparse Package registration." -ForegroundColor Green
} else {
    Write-Host "No registered Sparse Package found for $PackageName." -ForegroundColor Yellow
}

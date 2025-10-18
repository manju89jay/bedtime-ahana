#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

if ($env:CI -eq "true") {
    Write-Host "CI environment detected. Installing dependencies with npm ci..."
    npm ci
}
elseif (Test-Path "node_modules") {
    Write-Host "Dependencies already installed. Skipping npm ci."
}
else {
    Write-Host "Installing dependencies with npm ci..."
    npm ci
}

Write-Host "Running lint checks..."
npm run lint

Write-Host "Running test coverage..."
npm run coverage

Write-Host "Building application..."
npm run build

Write-Host "Build pipeline completed successfully."

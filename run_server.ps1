# Custom Auto-Runner for Acropolis Campus Hiring REST Server
# This script automatically downloads Maven (if not present), compiles the project, and launches the server.

$ErrorActionPreference = "Stop"

# 1. Check if Maven is available in the custom local directory
$LocalMavenDir = Join-Path $PSScriptRoot "apache-maven-3.9.6"
$MvnPath = Join-Path $LocalMavenDir "bin\mvn.cmd"

if (-not (Test-Path $MvnPath)) {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "   PROVISIONING LOCAL MAVEN ENVIRONMENT   " -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    
    $ZipPath = Join-Path $PSScriptRoot "maven.zip"
    $DownloadUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
    
    Write-Host "Downloading Apache Maven (3.9.6) from archive..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath
    
    Write-Host "Extracting files to project workspace..." -ForegroundColor Yellow
    Expand-Archive -Path $ZipPath -DestinationPath $PSScriptRoot
    
    Write-Host "Cleaning up download archives..." -ForegroundColor Yellow
    Remove-Item -Path $ZipPath
    
    Write-Host "Local Maven environment provisioned successfully!`n" -ForegroundColor Green
}

# 2. Compile and launch the Spring Boot Application
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "      LAUNCHING SPRING BOOT REST SERVER    " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "Compiling Java sources and launching on port 8080..." -ForegroundColor Yellow

# Execute the local maven spring-boot:run target
& $MvnPath spring-boot:run

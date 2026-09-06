# Script para configurar GitHub Secrets
# Necesitas un GitHub Personal Access Token (PAT) con permisos: repo, workflow

param(
    [Parameter(Mandatory=True)]
    [string],
    [Parameter(Mandatory=True)]
    [string]
)

 =  webonlineinfo28-lgtm/anita-web

function Set-GitHubSecret {
    param([string], [string])
    
     = @{
        Authorization = Bearer 
        Accept = application/vnd.github+json
        X-GitHub-Api-Version = 2022-11-28
    }
    
     = https://api.github.com/repos//actions/secrets/public-key
     = Invoke-RestMethod -Uri  -Headers 
    
    Add-Type -AssemblyName System.Security
     = [Convert]::FromBase64String(.key)
     = [System.Security.Cryptography.RSA]::Create()
    .ImportRSAPublicKey(, [out])
     = .Encrypt([Text.Encoding]::UTF8.GetBytes(), [System.Security.Cryptography.RSASignaturePadding]::Pkcs1)
     = [Convert]::ToBase64String()
    
     = @{ encrypted_value = ; key_id = .key_id } | ConvertTo-Json
     = https://api.github.com/repos//actions/secrets/
    Invoke-RestMethod -Uri  -Headers  -Method PUT -Body 
}

Write-Host Configurando GitHub Secrets...
Set-GitHubSecret -Name VERCEL_TOKEN -Value 
Write-Host VERCEL_TOKEN configurado
Set-GitHubSecret -Name VERCEL_ORG_ID -Value team_MEW8F9FRa5t1GScDAeCQFn5A
Write-Host VERCEL_ORG_ID configurado
Set-GitHubSecret -Name VERCEL_PROJECT_ID -Value prj_5AhjbJo7jrbdS7EW2LPr8RCFCCq1
Write-Host VERCEL_PROJECT_ID configurado
Write-Host Todos los secrets configurados!

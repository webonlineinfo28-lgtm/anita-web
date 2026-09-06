# Auto-commit script for Anita Web
# Usage: .\gpush.ps1 "tu mensaje aquí"

$msg = if ($args[0]) { $args[0] } else { "update: cambios" }

git add -A
git commit -m $msg
git push

Write-Host ""
Write-Host "Done! Mensaje: $msg" -ForegroundColor Green

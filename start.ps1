$root = $PSScriptRoot
Start-Process -FilePath "node" -ArgumentList "$root\server\index.js" -PassThru | Out-Null
Start-Sleep -Seconds 4
Set-Location $root
& npx vite --host

Start-Process -FilePath "node" -ArgumentList "C:\Users\hi\OneDrive\Desktop\star2\star-home-design\server\index.js" -PassThru | Out-Null
Start-Sleep -Seconds 4
Set-Location "C:\Users\hi\OneDrive\Desktop\star2\star-home-design"
& npx vite --host

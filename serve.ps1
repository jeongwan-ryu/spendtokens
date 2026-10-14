# Serves index.html at http://localhost:8791 (browser notifications need localhost)
param([switch]$NoBrowser)
$port = 8791
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Coin signal server: http://localhost:$port  (close this window to stop)"
if (-not $NoBrowser) { Start-Process "http://localhost:$port/" }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = Join-Path $root "index.html"
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $ctx.Response.ContentType = "text/html; charset=utf-8"
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}

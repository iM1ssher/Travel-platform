$c = Get-Content -LiteralPath 'C:\Users\jason\travel-platform\package.json' -Raw
$utf8noBOM = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText('C:\Users\jason\travel-platform\package.json', $c, $utf8noBOM)
$c2 = Get-Content -LiteralPath 'C:\Users\jason\travel-platform\tsconfig.json' -Raw
[System.IO.File]::WriteAllText('C:\Users\jason\travel-platform\tsconfig.json', $c2, $utf8noBOM)


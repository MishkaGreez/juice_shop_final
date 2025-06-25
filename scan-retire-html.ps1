param (
    [string]$OutputFile = "retire-report.html"
)

# Проверка retire.js
if (-not (Get-Command "retire" -ErrorAction SilentlyContinue)) {
    Write-Error "Retire.js не установлен. Установите через 'npm install -g retire'"
    exit 1
}

# Временный JSON-файл
$tempJson = [System.IO.Path]::GetTempFileName()
retire --outputformat json > $tempJson

# Прочитать как строку
$jsonRaw = Get-Content $tempJson -Raw
Remove-Item $tempJson

# Экранируем для JS (минимально)
$escapedJson = $jsonRaw -replace '\\', '\\\\' -replace '"', '\"' -replace "`r?`n", '\n'

# HTML-отчёт
$htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Retire.js Report</title>
    <style>
        body {
            font-family: monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
        }
        pre {
            background: #2d2d2d;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
        }
        .key { color: #9cdcfe; }
        .string { color: #ce9178; }
        .number { color: #b5cea8; }
        .boolean { color: #569cd6; }
        .null { color: #808080; }
    </style>
</head>
<body>
    <h1>Retire.js Report</h1>
    <pre id="json">Загрузка...</pre>

    <script>
        const jsonText = "$escapedJson";
        const data = JSON.parse(jsonText);

        function syntaxHighlight(json) {
            json = JSON.stringify(json, null, 2);
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+(\.\d+)?\b)/g, function (match) {
                let cls = 'number';
                if (/^"/.test(match)) {
                    cls = /:$/.test(match) ? 'key' : 'string';
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }

        document.getElementById("json").innerHTML = syntaxHighlight(data);
    </script>
</body>
</html>
"@

# Сохраняем
$htmlContent | Out-File -Encoding UTF8 -FilePath $OutputFile

Write-Host "HTML-отчёт сохранён: $OutputFile"
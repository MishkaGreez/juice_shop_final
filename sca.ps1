param (
    [string]$OutputFile = "vulns.html"
)

# Проверяем наличие retire.js
if (-not (Get-Command "retire" -ErrorAction SilentlyContinue)) {
    Write-Error "Retire.js не установлен. Установите его через 'npm install -g retire'"
    exit 1
}

# Получаем JSON-отчёт
$tempJson = [System.IO.Path]::GetTempFileName()
retire --outputformat json > $tempJson

# Чтение JSON-строки
$jsonRaw = Get-Content $tempJson -Raw
Remove-Item $tempJson

# HTML-шаблон с вставкой JSON
$htmlTemplate = @"
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Отчёт Retire.js</title>
    <style>
        body { font-family: Arial; background: #1e1e1e; color: #f0f0f0; padding: 20px; }
        h1 { color: #66ccff; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #444; padding: 8px; }
        th { background: #2e2e2e; }
        .json-output { white-space: pre-wrap; background: #111; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Отчёт Retire.js</h1>
    <h2>JSON-данные</h2>
    <div class="json-output" id="json-content">Загрузка...</div>

    <script type="application/json" id="json-data">
__JSON_PLACEHOLDER__
    </script>
    <script>
        const data = document.getElementById("json-data").textContent;
        document.getElementById("json-content").textContent = data;
    </script>
</body>
</html>
"@

# Подставляем JSON как есть (без экранирования)
$htmlFinal = $htmlTemplate -replace '__JSON_PLACEHOLDER__', $jsonRaw

# Сохраняем файл в UTF-8 без BOM — именно так
[System.IO.File]::WriteAllText($OutputFile, $htmlFinal, [System.Text.Encoding]::UTF8)

Write-Host "✅ Отчёт успешно сохранён: $OutputFile"
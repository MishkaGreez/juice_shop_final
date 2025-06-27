param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

# Добавление всех изменений
git add .

#test secret
npm run gitleaks:staged
.\kics\bin\kics.exe scan -p "D:\repo-uni\juice_shop_final" --report-formats json -o ./kics-results

# Коммит с переданным сообщением
git commit -m "$CommitMessage"
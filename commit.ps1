param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

# Добавление всех изменений
git add .

#test secret
npm run gitleaks:staged

# Коммит с переданным сообщением
git commit -m "$CommitMessage"
param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

# Добавление всех изменений
git add .

# Коммит с переданным сообщением
git commit -m "$CommitMessage"
param(
  [string]$Remote = "origin",
  [string]$Branch = "godaddy-dist",
  [int64]$BatchBytes = 1000MB,
  [switch]$PushEachBatch,
  [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

$repo = (Get-Location).Path
$dist = Join-Path $repo "dist"
$cpanelFile = Join-Path $repo ".cpanel.yml"

if (-not (Test-Path -LiteralPath $dist -PathType Container)) {
  throw "No existe la carpeta dist. Ejecuta npm run build antes de publicar."
}

if (-not (Test-Path -LiteralPath $cpanelFile -PathType Leaf)) {
  throw "No existe .cpanel.yml. Ese archivo es necesario para GoDaddy/cPanel."
}

function Convert-ToGitPath {
  param([string]$Path)
  return ((Resolve-Path -Relative -LiteralPath $Path) -replace "^\.[\\/]", "") -replace "\\", "/"
}

function Invoke-CheckedGit {
  param([string[]]$GitArgs)
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "git $($GitArgs -join ' ') fallo con codigo $LASTEXITCODE"
  }
}

function New-DeployCommit {
  param(
    [AllowEmptyString()][string]$Parent,
    [string[]]$Paths,
    [string]$Message,
    [switch]$EmptyTree
  )

  $index = Join-Path $repo ".git\godaddy-dist.index"
  $pathspec = Join-Path $repo ".git\godaddy-dist-paths.txt"

  if (Test-Path -LiteralPath $index) { Remove-Item -LiteralPath $index -Force }
  if (Test-Path -LiteralPath $pathspec) { Remove-Item -LiteralPath $pathspec -Force }

  $previousIndex = $env:GIT_INDEX_FILE
  $env:GIT_INDEX_FILE = $index

  try {
    if ($EmptyTree) {
      Invoke-CheckedGit -GitArgs @("read-tree", "--empty")
    } else {
      Invoke-CheckedGit -GitArgs @("read-tree", $Parent)
    }

    [System.IO.File]::WriteAllLines($pathspec, $Paths, [System.Text.UTF8Encoding]::new($false))
    Invoke-CheckedGit -GitArgs @("add", "-f", "--pathspec-from-file=$pathspec")

    $tree = (& git write-tree).Trim()
    if ($LASTEXITCODE -ne 0) { throw "git write-tree fallo" }

    if ([string]::IsNullOrWhiteSpace($Parent)) {
      $commit = (& git commit-tree $tree -m $Message).Trim()
    } else {
      $commit = (& git commit-tree $tree -p $Parent -m $Message).Trim()
    }
    if ($LASTEXITCODE -ne 0) { throw "git commit-tree fallo" }

    Invoke-CheckedGit -GitArgs @("update-ref", "refs/heads/$Branch", $commit)
    return $commit
  } finally {
    if ($null -eq $previousIndex) {
      Remove-Item Env:GIT_INDEX_FILE -ErrorAction SilentlyContinue
    } else {
      $env:GIT_INDEX_FILE = $previousIndex
    }
    if (Test-Path -LiteralPath $pathspec) { Remove-Item -LiteralPath $pathspec -Force }
  }
}

function Push-DeployCommit {
  param([string]$Commit)
  if ($SkipPush) { return }

  $env:GIT_TERMINAL_PROMPT = "0"
  $refspec = "$Commit`:refs/heads/$Branch"
  Invoke-CheckedGit -GitArgs @("push", "--porcelain", $Remote, $refspec)
}

function Push-DeployCommitIfNeeded {
  param([string]$Commit)
  if ($PushEachBatch) {
    Push-DeployCommit $Commit
  }
}

$gitName = (@(& git config user.name) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($gitName)) { $gitName = "ZavalaIvan" }

$gitEmail = (@(& git config user.email) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($gitEmail)) { $gitEmail = "ivan.soportetec@gmail.com" }

$env:GIT_AUTHOR_NAME = $gitName
$env:GIT_AUTHOR_EMAIL = $gitEmail
$env:GIT_COMMITTER_NAME = $gitName
$env:GIT_COMMITTER_EMAIL = $gitEmail

$remoteBranch = @(& git ls-remote --heads $Remote $Branch) -join ""
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($remoteBranch)) {
  Invoke-CheckedGit -GitArgs @("fetch", $Remote, "+refs/heads/$Branch`:refs/remotes/$Remote/$Branch")
  $base = (& git rev-parse --verify "refs/remotes/$Remote/$Branch").Trim()
} else {
  & git show-ref --verify --quiet "refs/heads/$Branch"
  if ($LASTEXITCODE -eq 0) {
    $base = (& git rev-parse --verify "refs/heads/$Branch").Trim()
  } else {
    $base = ""
  }
}

$current = New-DeployCommit -Parent $base -Paths @(".cpanel.yml") -Message "Reset GoDaddy deployment tree" -EmptyTree
Push-DeployCommitIfNeeded $current

$supportFiles = Get-ChildItem -LiteralPath $dist -Recurse -File |
  ForEach-Object { Convert-ToGitPath $_.FullName }

if ($supportFiles.Count -gt 0) {
  $current = New-DeployCommit -Parent $current -Paths ([string[]]$supportFiles) -Message "Update GoDaddy dist support files"
  Push-DeployCommitIfNeeded $current
}

if (-not $PushEachBatch) {
  Push-DeployCommit $current
}

Write-Host "Rama $Branch lista en $current"

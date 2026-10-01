<#
  Pulls live stats for your games from Roblox's public APIs and writes assets/data/roblox.js,
  which the site reads. Runs on a schedule in GitHub Actions (.github/workflows/roblox-stats.yml),
  and you can run it locally too:  pwsh scripts/update-roblox.ps1   (or Windows PowerShell)

  Input:  data/roblox.config.json
    { "robloxUserId": 123,
      "games": [ { "placeId": 920587237, "role": "Creator", "peakCCU": 12000 } ] }
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$config = Get-Content (Join-Path $root "data/roblox.config.json") -Raw | ConvertFrom-Json
$outFile = Join-Path $root "assets/data/roblox.js"

if (-not $config.games -or $config.games.Count -eq 0) {
  Write-Host "No games in data/roblox.config.json yet. Leaving the example data in place."
  exit 0
}

function Get-Json($url) {
  for ($i = 0; $i -lt 3; $i++) {
    try {
      # decode as UTF-8 explicitly so emoji in game names survive on every PowerShell version
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{ "Accept" = "application/json" } -TimeoutSec 30
      return [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
    }
    catch { Start-Sleep -Seconds (2 * ($i + 1)) }
  }
  throw "Request failed: $url"
}

# place IDs -> universe IDs
$entries = @()
foreach ($g in $config.games) {
  $u = Get-Json "https://apis.roblox.com/universes/v1/places/$($g.placeId)/universe"
  $entries += [pscustomobject]@{ placeId = [long]$g.placeId; universeId = [long]$u.universeId; role = $g.role; peakCCU = $g.peakCCU }
}
$ids = ($entries | ForEach-Object { $_.universeId }) -join ","

$games = (Get-Json "https://games.roblox.com/v1/games?universeIds=$ids").data
$votes = (Get-Json "https://games.roblox.com/v1/games/votes?universeIds=$ids").data
$icons = (Get-Json "https://thumbnails.roblox.com/v1/games/icons?universeIds=$ids&size=256x256&format=Png&isCircular=false&returnPolicy=PlaceHolder").data
$thumbs = (Get-Json "https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=$ids&countPerUniverse=6&defaults=true&size=768x432&format=Png&isCircular=false").data

# The services section shows each game's real store and badges. These are optional extras:
# if Roblox changes one of these endpoints, the stats above still update.
function Get-Optional($url) { try { return Get-Json $url } catch { Write-Host "Skipped: $url"; return $null } }

function Get-Passes($universeId) {
  $r = Get-Optional "https://apis.roblox.com/game-passes/v1/universes/$universeId/game-passes?passView=Full&pageSize=50"
  if (-not $r -or -not $r.gamePasses) { return @{ count = 0; list = @() } }
  $forSale = @($r.gamePasses | Where-Object { $_.isForSale -and $_.price -gt 0 } | Sort-Object { [long]$_.price })
  if (-not $forSale.Count) { return @{ count = 0; list = @() } }
  # a spread across the price ladder (cheap, mid, premium), one pass per price point
  $n = $forSale.Count; $k = [math]::Min(6, $n)
  $seen = @{}
  $pick = @(for ($i = 0; $i -lt $k; $i++) {
    $p = $forSale[[int][math]::Round($i * ($n - 1) / [math]::Max(1, $k - 1))]
    if (-not $seen[[string]$p.price]) { $seen[[string]$p.price] = $true; $p }
  })
  $art = @{}
  if ($pick.Count) {
    $passIds = ($pick | ForEach-Object { $_.id }) -join ","
    $t = Get-Optional "https://thumbnails.roblox.com/v1/game-passes?gamePassIds=$passIds&size=150x150&format=Png&isCircular=false"
    if ($t) { $t.data | Where-Object { $_.state -eq "Completed" } | ForEach-Object { $art[[string]$_.targetId] = $_.imageUrl } }
  }
  $list = foreach ($p in $pick) {
    if (-not $art[[string]$p.id]) { continue }
    [ordered]@{ name = $p.displayName.Trim(); price = [long]$p.price; icon = $art[[string]$p.id] }
  }
  return @{ count = $forSale.Count; list = @($list) }
}

function Get-Badges($universeId) {
  $r = Get-Optional "https://badges.roblox.com/v1/universes/$universeId/badges?limit=100&sortOrder=Asc"
  if (-not $r -or -not $r.data) { return @() }
  $top = @($r.data | Where-Object { $_.enabled -ne $false } | Sort-Object { [long]$_.statistics.awardedCount } -Descending | Select-Object -First 3)
  if (-not $top.Count) { return @() }
  $badgeIds = ($top | ForEach-Object { $_.id }) -join ","
  $art = @{}
  $t = Get-Optional "https://thumbnails.roblox.com/v1/badges/icons?badgeIds=$badgeIds&size=150x150&format=Png&isCircular=false"
  if ($t) { $t.data | Where-Object { $_.state -eq "Completed" } | ForEach-Object { $art[[string]$_.targetId] = $_.imageUrl } }
  return @(foreach ($b in $top) {
    if (-not $art[[string]$b.id]) { continue }
    [ordered]@{ name = $b.name.Trim(); awarded = [long]$b.statistics.awardedCount; pastDay = [long]$b.statistics.pastDayAwardedCount; icon = $art[[string]$b.id] }
  })
}

$list = foreach ($e in $entries) {
  $g = $games | Where-Object { $_.id -eq $e.universeId } | Select-Object -First 1
  $v = $votes | Where-Object { $_.id -eq $e.universeId } | Select-Object -First 1
  $i = $icons | Where-Object { $_.targetId -eq $e.universeId } | Select-Object -First 1
  $t = $thumbs | Where-Object { $_.universeId -eq $e.universeId } | Select-Object -First 1
  $shots = @(if ($t -and $t.thumbnails) { $t.thumbnails | Where-Object { $_.state -eq "Completed" -and $_.imageUrl } | ForEach-Object { $_.imageUrl } })
  $passes = Get-Passes $e.universeId
  $total = [double]($v.upVotes + $v.downVotes)
  [ordered]@{
    name      = $g.name
    url       = "https://www.roblox.com/games/$($e.placeId)"
    icon      = $i.imageUrl
    thumb     = $(if ($shots.Count) { $shots[0] } else { $null })
    thumbs    = $shots
    creator   = $g.creator.name
    role      = $e.role
    visits    = [long]$g.visits
    playing   = [long]$g.playing
    favorites = [long]$g.favoritedCount
    likeRatio = $(if ($total -gt 0) { [math]::Round($v.upVotes / $total * 100) } else { $null })
    peakCCU   = $e.peakCCU
    updated   = $(if ($g.updated) { ([datetime]$g.updated).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") } else { $null })
    passCount = $passes.count
    passes    = $passes.list
    badges    = @(Get-Badges $e.universeId)
  }
}
$list = @($list | Sort-Object { $_.visits } -Descending)

$headshot = $null
if ($config.robloxUserId) {
  $h = Get-Json "https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=$($config.robloxUserId)&size=420x420&format=Png&isCircular=false"
  $headshot = $h.data[0].imageUrl
}

$data = [ordered]@{
  example   = $false
  updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  headshot  = $headshot
  games     = $list
}
$json = $data | ConvertTo-Json -Depth 6
$js = "/* Generated by scripts/update-roblox.ps1. Do not edit by hand. */`nwindow.ROBLOX_DATA = $json;`n"
New-Item -ItemType Directory -Force (Split-Path $outFile) | Out-Null
[IO.File]::WriteAllText($outFile, $js, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Wrote $($list.Count) games to assets/data/roblox.js"

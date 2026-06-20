# GitHub Actions Monitor Script (PowerShell)
# Usage: .\scripts\check-actions.ps1

param(
    [string]$RepoPath = ""
)

# Get GitHub repo from git config
$origin = git remote get-url origin
if ($origin -match 'github\.com[:/](.+?)/(.+?)(?:\.git)?$') {
    $owner = $matches[1]
    $repo = $matches[2]
} else {
    Write-Host "Error: Could not determine GitHub repository"
    exit 1
}

$apiUrl = "https://api.github.com/repos/$owner/$repo/actions/runs?per_page=15&sort=created&direction=desc"
$dashboardUrl = "https://github.com/$owner/$repo/actions"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "GitHub Actions Monitor" -ForegroundColor Cyan
Write-Host "Repository: $owner/$repo" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -ErrorAction Stop

    if ($response.workflow_runs.Count -eq 0) {
        Write-Host "No workflow runs found" -ForegroundColor Yellow
    } else {
        Write-Host "Recent Workflow Runs:" -ForegroundColor Yellow
        Write-Host "===================" -ForegroundColor Yellow
        Write-Host ""

        $response.workflow_runs | ForEach-Object {
            $date = ([datetime]$_.updated_at).ToString("yyyy-MM-dd HH:mm")
            $name = $_.name
            $branch = $_.head_branch
            $status = if ($_.conclusion) { $_.conclusion } else { "IN PROGRESS" }

            # Color code status
            $statusColor = switch ($status) {
                "success" { "Green" }
                "failure" { "Red" }
                "cancelled" { "Yellow" }
                "in_progress" { "Cyan" }
                default { "White" }
            }

            $line = "$date | $(($status).PadRight(12)) | $name | $branch"
            Write-Host $line -ForegroundColor $statusColor
        }

        Write-Host ""
        Write-Host "View Details:" -ForegroundColor Yellow
        Write-Host "Dashboard: $dashboardUrl" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "Error fetching workflow data: $_" -ForegroundColor Red
    Write-Host "Dashboard: $dashboardUrl" -ForegroundColor Cyan
}

Write-Host ""

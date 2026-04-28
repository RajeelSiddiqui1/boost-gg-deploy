$filePath = "GameHub.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Search for "Uncompromising" which is unique text in the features section
$idx = $content.IndexOf("Uncompromising")
Write-Host "Uncompromising found at: $idx"

# Search for "REVIEWS" to find the boundary
$revIdx = $content.IndexOf("REVIEWS")
Write-Host "REVIEWS found at: $revIdx"

# Get a snippet of text around the features section
if ($idx -gt 0) {
    $snippet = $content.Substring([Math]::Max(0, $idx-200), 400)
    Write-Host "SNIPPET: [$snippet]"
}

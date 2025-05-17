# Create new directory structure
$directories = @(
    "src/components/common",
    "src/components/features/music",
    "src/components/features/queue",
    "src/components/features/playlist",
    "src/components/layouts",
    "src/hooks/common",
    "src/hooks/features",
    "src/services/api",
    "src/services/storage",
    "src/store/queries",
    "src/store/mutations",
    "src/types",
    "src/tests/unit",
    "src/tests/integration"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir
        Write-Host "Created directory: $dir"
    }
}

# Move components to their new locations
$moves = @{
    "src/components/MusicPlayer.tsx"       = "src/components/features/music/"
    "src/components/SongItem.tsx"          = "src/components/features/music/"
    "src/components/QueueList.tsx"         = "src/components/features/queue/"
    "src/components/SortableSongItem.tsx"  = "src/components/features/queue/"
    "src/components/QueueSidebar.tsx"      = "src/components/features/queue/"
    "src/components/LayoutContent.tsx"     = "src/components/layouts/"
    "src/components/Providers.tsx"         = "src/components/layouts/"
    "src/components/RecentlyPlayed.tsx"    = "src/components/features/music/"
    "src/components/PlaylistSongs.tsx"     = "src/components/features/playlist/"
    "src/components/ConfirmModal.tsx"      = "src/components/common/"
    "src/components/Navigation.tsx"        = "src/components/layouts/"
    "src/components/ThemeProvider.tsx"     = "src/components/layouts/"
    "src/components/FeaturedPlaylists.tsx" = "src/components/features/playlist/"
    "src/components/AddToPlaylist.tsx"     = "src/components/features/playlist/"
}

foreach ($move in $moves.GetEnumerator()) {
    if (Test-Path $move.Key) {
        $destination = $move.Value
        if (-not (Test-Path $destination)) {
            New-Item -ItemType Directory -Force -Path $destination
        }
        Move-Item -Path $move.Key -Destination $destination -Force
        Write-Host "Moved $($move.Key) to $($move.Value)"
    }
    else {
        Write-Host "Warning: Source file not found: $($move.Key)"
    }
}

# Move utils
if (Test-Path "src/utils/formatDuration.ts") {
    Move-Item -Path "src/utils/formatDuration.ts" -Destination "src/utils/" -Force
    Write-Host "Moved formatDuration.ts"
}

# Move context files
if (Test-Path "src/context") {
    if (-not (Test-Path "src/store")) {
        New-Item -ItemType Directory -Force -Path "src/store"
    }
    Get-ChildItem -Path "src/context" | Move-Item -Destination "src/store/" -Force
    Remove-Item -Path "src/context" -Force
    Write-Host "Moved context files to store"
}

# Move contexts directory if it exists
if (Test-Path "src/contexts") {
    if (-not (Test-Path "src/store")) {
        New-Item -ItemType Directory -Force -Path "src/store"
    }
    Get-ChildItem -Path "src/contexts" | Move-Item -Destination "src/store/" -Force
    Remove-Item -Path "src/contexts" -Force
    Write-Host "Moved contexts files to store"
}

Write-Host "Project structure reorganization completed!" 
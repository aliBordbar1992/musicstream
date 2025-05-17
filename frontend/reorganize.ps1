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
    New-Item -ItemType Directory -Force -Path $dir
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
        Move-Item -Path $move.Key -Destination $move.Value -Force
    }
}

# Move utils
Move-Item -Path "src/utils/formatDuration.ts" -Destination "src/utils/" -Force

# Move context files
if (Test-Path "src/context") {
    Move-Item -Path "src/context/*" -Destination "src/store/" -Force
    Remove-Item -Path "src/context" -Force
}

# Move contexts directory if it exists
if (Test-Path "src/contexts") {
    Move-Item -Path "src/contexts/*" -Destination "src/store/" -Force
    Remove-Item -Path "src/contexts" -Force
}

Write-Host "Project structure reorganization completed!" 
@echo off
cd src

REM Create directories
mkdir components\features\music
mkdir components\features\queue
mkdir components\features\playlist
mkdir components\layouts
mkdir components\common
mkdir hooks\common
mkdir hooks\features
mkdir services\api
mkdir services\storage
mkdir store\queries
mkdir store\mutations
mkdir types
mkdir tests\unit
mkdir tests\integration

REM Move components
move components\MusicPlayer.tsx components\features\music\
move components\SongItem.tsx components\features\music\
move components\QueueList.tsx components\features\queue\
move components\SortableSongItem.tsx components\features\queue\
move components\QueueSidebar.tsx components\features\queue\
move components\LayoutContent.tsx components\layouts\
move components\Providers.tsx components\layouts\
move components\RecentlyPlayed.tsx components\features\music\
move components\PlaylistSongs.tsx components\features\playlist\
move components\ConfirmModal.tsx components\common\
move components\Navigation.tsx components\layouts\
move components\ThemeProvider.tsx components\layouts\
move components\FeaturedPlaylists.tsx components\features\playlist\
move components\AddToPlaylist.tsx components\features\playlist\

REM Move context files
if exist context (
    move context\* store\
    rmdir context
)

REM Move contexts directory
if exist contexts (
    move contexts\* store\
    rmdir contexts
)

echo Project structure reorganization completed! 
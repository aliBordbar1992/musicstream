import { useState, useEffect, useRef } from "react";
import { music } from "@/lib/api";
import Input from "./Input";
import { Music } from "@/types/domain";
import Image from "next/image";
import { Loading } from "./Loading";

export default function MusicSearch({
  value,
  onChange,
  onMusicSelect,
  error,
  required,
  excludeIds = [],
}: MusicSearchProps) {
  const [songs, setSongs] = useState<Music[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSongs = async () => {
      if (!value) return;
      setLoading(true);
      try {
        const results = await music.search(value);
        // Filter out excluded songs
        const filteredResults = results.filter(
          (song) => !excludeIds.includes(song.id)
        );
        setSongs(filteredResults);
      } catch (error) {
        console.error("Failed to load songs:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadSongs, 300);
    return () => clearTimeout(timeoutId);
  }, [value, excludeIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleMusicSelect = (song: Music) => {
    onChange(song.title);
    onMusicSelect?.(song);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Input
        id="music"
        name="music"
        label="Search Music"
        value={value}
        onChange={handleInputChange}
        placeholder="Search for a song..."
        required={required}
        error={error}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && value && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 shadow-lg rounded-md border border-gray-200 dark:border-neutral-700 max-h-60 overflow-auto">
          {loading ? (
            <div className="p-2 text-center">
              <Loading size="sm" />
            </div>
          ) : songs.length > 0 ? (
            <ul>
              {songs.map((song) => (
                <li
                  key={song.id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                  onClick={() => handleMusicSelect(song)}
                >
                  <div className="flex items-center gap-2">
                    {song.image && (
                      <Image
                        src={song.image}
                        alt={song.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {song.artist.name}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-gray-500 dark:text-gray-400">
              No songs found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

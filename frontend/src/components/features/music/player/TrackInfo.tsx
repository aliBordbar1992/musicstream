import Image from "next/image";
import { PlayerTrack } from "@/types/domain";

interface TrackInfoProps {
  track: PlayerTrack;
}

export function TrackInfo({ track }: TrackInfoProps) {
  return (
    <div className="flex items-center space-x-6 min-w-[200px] w-[25%]">
      <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-md overflow-hidden flex-shrink-0">
        {track.image && (
          <Image
            key={track.id}
            src={track.image}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-neutral-900 dark:text-white">
          {track.title}
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {track.artist}
        </span>
      </div>
    </div>
  );
}

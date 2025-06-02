import Image from "next/image";
import { PlayerTrack } from "@/types/domain";

interface TrackInfoProps {
  track: PlayerTrack;
}

export function TrackInfo({ track }: TrackInfoProps) {
  return (
    <div className="track-info">
      <div className="track-image">
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
        <span className="track-title">{track.title}</span>
        <span className="track-artist">{track.artist}</span>
      </div>
    </div>
  );
}

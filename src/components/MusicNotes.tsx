import { useEffect, useState } from 'react';

interface Note {
  id: number;
  left: number;
  delay: number;
  size: number;
  type: 'eighth' | 'quarter' | 'double';
}

const NoteIcon = ({ type, size }: { type: string; size: number }) => {
  if (type === 'eighth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="fill-gold">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    );
  }
  if (type === 'double') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="fill-gold">
        <path d="M21 3V15.5a3.5 3.5 0 1 1-2-3.163V5H11v10.5a3.5 3.5 0 1 1-2-3.163V3h12z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="fill-gold">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3h-2z" />
    </svg>
  );
};

export const MusicNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const items: Note[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      delay: Math.random() * 6,
      size: 20 + Math.random() * 16,
      type: ['eighth', 'quarter', 'double'][Math.floor(Math.random() * 3)] as 'eighth' | 'quarter' | 'double',
    }));
    setNotes(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute bottom-10 animate-music-note opacity-60"
          style={{
            left: `${note.left}%`,
            animationDelay: `${note.delay}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
          }}
        >
          <NoteIcon type={note.type} size={note.size} />
        </div>
      ))}
    </div>
  );
};

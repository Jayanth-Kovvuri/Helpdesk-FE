import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

type FilePickButtonProps = {
  label: string;
  onFileSelected: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
  selectedFileName?: string | null;
  /** Increment to clear the native input (e.g. after a successful upload). */
  clearSignal?: number;
};

export function FilePickButton({
  label,
  onFileSelected,
  multiple = false,
  className,
  selectedFileName,
  clearSignal = 0,
}: FilePickButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [clearSignal]);

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const list = event.target.files;
          if (!list?.length) {
            onFileSelected([]);
            return;
          }
          onFileSelected(Array.from(list));
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-helpdesk-primary bg-white px-4 py-2 text-sm font-medium text-helpdesk-primary hover:bg-blue-50"
      >
        {label}
      </button>
      {selectedFileName ? (
        <span className="max-w-full truncate text-xs text-slate-500">{selectedFileName}</span>
      ) : null}
    </div>
  );
}

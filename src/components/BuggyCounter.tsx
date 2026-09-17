import { useState } from 'react';

/** Toggle in App to demonstrate react-error-boundary recovery. */
export function BuggyCounter() {
  const [count, setCount] = useState(0);

  if (count > 2) {
    throw new Error('BuggyCounter intentionally crashed (count > 2)');
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
      <p className="font-medium text-amber-900">Error boundary demo</p>
      <p className="mt-1 text-amber-800">Count: {count} — crash after 3 clicks.</p>
      <button
        type="button"
        className="mt-2 rounded-md bg-amber-600 px-3 py-1.5 text-white"
        onClick={() => {
          setCount((value) => value + 1);
        }}
      >
        Increment
      </button>
    </div>
  );
}

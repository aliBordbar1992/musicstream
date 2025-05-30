import { useState } from "react";

interface SecurityWarningProps {
  onAccept: (accepted: boolean) => void;
}

export default function SecurityWarning({ onAccept }: SecurityWarningProps) {
  const [accepted, setAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccepted(e.target.checked);
    onAccept(e.target.checked);
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Security Warning
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>
              This application is for personal entertainment purposes only.
              Please note:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Passwords are stored in plain text</li>
              <li>No encryption is used</li>
              <li>Security is not a priority</li>
              <li>This is not a production-ready application</li>
            </ul>
            <p className="mt-2 font-medium">
              DO NOT use passwords that you use on other websites or services.
            </p>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="security-warning"
                name="security-warning"
                type="checkbox"
                checked={accepted}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label
                htmlFor="security-warning"
                className="ml-2 block text-sm text-yellow-800 dark:text-yellow-200"
              >
                I understand and accept the security risks
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

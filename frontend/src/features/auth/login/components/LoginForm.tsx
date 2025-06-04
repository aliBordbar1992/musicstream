import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState } from "react";

export interface LoginFormProps {
  isDisabled: boolean;
  formClassName?: string;
  onLogin: (username: string, password: string) => void;
}

export default function LoginForm({
  isDisabled,
  formClassName,
  onLogin,
}: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await onLogin(username, password);
    } catch {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={formClassName} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Input
          id="username"
          name="username"
          required
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          id="password"
          name="password"
          required
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isDisabled}
        className={`w-full ${isLoading ? "" : "py-4"}`}
      >
        {isLoading ? "" : "Sign in"}
      </Button>
    </form>
  );
}

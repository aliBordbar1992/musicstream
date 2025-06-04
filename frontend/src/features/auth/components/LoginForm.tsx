import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";

export interface LoginFormProps {
  isDisabled: boolean;
  formClassName?: string;
  onLogin: (username: string, password: string) => void;
}

const schema = yup
  .object()
  .shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

type LoginFormData = yup.InferType<typeof schema>;

export default function LoginForm({
  isDisabled,
  formClassName,
  onLogin,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isDisabled) return;

    try {
      await onLogin(data.username, data.password);
      toast.success("Login successful");
    } catch {
      toast.error("Invalid username or password");
    }
  };
  return (
    <form className={formClassName} onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Input
          id="username"
          placeholder="Username"
          {...register("username")}
          error={errors.username?.message}
        />
        <Input
          id="password"
          required
          placeholder="Password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isDisabled}
        className={`w-full ${isSubmitting ? "" : "py-4"}`}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

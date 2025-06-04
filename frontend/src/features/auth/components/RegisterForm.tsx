import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export interface RegisterFormProps {
  isDisabled: boolean;
  formClassName?: string;
  onRegister: (username: string, password: string) => void;
}

const schema = yup
  .object({
    username: yup
      .string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
  })
  .required();

type RegisterFormData = yup.InferType<typeof schema>;

export default function RegisterForm({
  isDisabled,
  formClassName,
  onRegister,
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (isDisabled) return;

    try {
      await onRegister(data.username, data.password);
      toast.success("Registration successful! Please login.");
    } catch {
      toast.error("Registration failed. Username may already be taken.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={formClassName}>
      <Input
        id="username"
        label="Username"
        type="text"
        {...register("username")}
        error={errors.username?.message}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />

      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        disabled={isDisabled}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  type Location,
} from "react-router-dom";
import {
  Alert,
  Button,
  Field,
  Input,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setAuthError(error.message);
      return;
    }
    const from =
      (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
    navigate(from, { replace: true });
  };

  return (
    <Stack as="form" gap={4} onSubmit={handleSubmit(onSubmit)}>
      {authError && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{authError}</Alert.Title>
        </Alert.Root>
      )}

      <Field.Root invalid={!!errors.email}>
        <Field.Label>Email</Field.Label>
        <Input type="email" autoComplete="email" {...register("email")} />
        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.password}>
        <Field.Label>Password</Field.Label>
        <Input
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
      </Field.Root>

      <Button type="submit" colorPalette="brand" loading={isSubmitting}>
        Log in
      </Button>

      <Text fontSize="sm" textAlign="center">
        Don&apos;t have an account?{" "}
        <ChakraLink asChild>
          <RouterLink to="/signup">Sign up</RouterLink>
        </ChakraLink>
      </Text>
      <Text fontSize="sm" textAlign="center">
        <ChakraLink asChild>
          <RouterLink to="/forgot-password">Forgot password?</RouterLink>
        </ChakraLink>
      </Text>
    </Stack>
  );
}

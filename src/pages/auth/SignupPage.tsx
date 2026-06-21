import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormValues) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (!data.session) {
      setAuthError(
        "Account created, but email confirmation is required. Check your Supabase Auth settings to disable it, or confirm via email.",
      );
      return;
    }
    navigate("/", { replace: true });
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
          autoComplete="new-password"
          {...register("password")}
        />
        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.confirmPassword}>
        <Field.Label>Confirm password</Field.Label>
        <Input
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
      </Field.Root>

      <Button type="submit" colorPalette="brand" loading={isSubmitting}>
        Sign up
      </Button>

      <Text fontSize="sm" textAlign="center">
        Already have an account?{" "}
        <ChakraLink asChild>
          <RouterLink to="/login">Log in</RouterLink>
        </ChakraLink>
      </Text>
    </Stack>
  );
}

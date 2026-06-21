import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink } from "react-router-dom";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(
      values.email,
      { redirectTo: `${window.location.origin}/login` },
    );
    if (error) {
      setAuthError(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <Stack gap={4}>
        <Alert.Root status="success">
          <Alert.Indicator />
          <Alert.Title>
            If an account exists for that email, a reset link is on its way.
          </Alert.Title>
        </Alert.Root>
        <Text fontSize="sm" textAlign="center">
          <ChakraLink asChild>
            <RouterLink to="/login">Back to login</RouterLink>
          </ChakraLink>
        </Text>
      </Stack>
    );
  }

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

      <Button type="submit" colorPalette="brand" loading={isSubmitting}>
        Send reset link
      </Button>

      <Text fontSize="sm" textAlign="center">
        <ChakraLink asChild>
          <RouterLink to="/login">Back to login</RouterLink>
        </ChakraLink>
      </Text>
    </Stack>
  );
}

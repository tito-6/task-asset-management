import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { useLoginMutation } from "../features/auth/authApi.js";
import { useAppSelector } from "../app/hooks.js";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
  }, [token, from, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await login({ email, password }).unwrap();
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage("Invalid email or password");
    }
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 400 }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" component="h1" textAlign="center">
            Welcome Back
          </Typography>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            Log In
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Паролі не співпадають');
            return;
        }

        if (password.length < 3) {
            setError('Пароль повинен містити мінімум 3 символи');
            return;
        }

        setLoading(true);

        try {
            await register(username, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Помилка реєстрації');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Реєстрація нового користувача
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Створіть акаунт, щоб зберігати свою візитку, формувати резюме та
                    ділитися публічним профілем.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Логін"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        margin="normal"
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Пароль"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        margin="normal"
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Підтвердження пароля"
                        type="password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        margin="normal"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        color="success"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Зареєструватися'}
                    </Button>
                    <Typography variant="body2" align="center" color="text.secondary">
                        Вже маєте акаунт?{' '}
                        <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            Увійти
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

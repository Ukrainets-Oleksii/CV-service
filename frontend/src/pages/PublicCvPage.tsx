import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Divider,
    Box,
    Stack,
    Chip,
    CircularProgress,
    Alert,
    Link as MuiLink,
    IconButton,
    Tooltip,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { api } from '../api/client';
import type { PublicResumeDto, TemplateType } from '../api/client';

type TemplateTheme = {
    container: Record<string, unknown>;
    paper: Record<string, unknown>;
    divider: Record<string, unknown>;
    chip: Record<string, unknown>;
    chipVariant: 'outlined' | 'filled';
    sectionWrapper?: Record<string, unknown>;
    titleVariant: 'h3' | 'h2';
    textColor: string;
    subtextColor: string;
    accentColor?: string;
    headerAddon?: React.ReactNode;
};

const templateStyles: Record<TemplateType, TemplateTheme> = {
    MINIMAL: {
        container: {
            backgroundColor: '#f5f7fb',
            minHeight: '100vh',
            py: 8,
        },
        paper: {
            backgroundColor: '#ffffff',
            boxShadow: '0 30px 80px rgba(15, 23, 42, 0.08)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
        },
        divider: {
            borderColor: '#e2e8f0',
            my: 3,
        },
        chip: {
            borderColor: '#cbd5f5',
            color: '#1e293b',
        },
        chipVariant: 'outlined',
        sectionWrapper: {
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            backgroundColor: '#f8fafc',
            p: 2,
        },
        titleVariant: 'h3',
        textColor: '#0f172a',
        subtextColor: 'rgba(15,23,42,0.75)',
    },
    RETRO: {
        container: {
            background: 'linear-gradient(135deg, #f5e6d3 0%, #f8d7da 50%, #d1ecf1 100%)',
            minHeight: '100vh',
            py: 8,
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 69, 19, 0.03) 2px, rgba(139, 69, 19, 0.03) 4px),
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 69, 19, 0.03) 2px, rgba(139, 69, 19, 0.03) 4px)
                `,
                pointerEvents: 'none',
            },
        },
        paper: {
            backgroundColor: '#fffef9',
            border: '3px double #d4a574',
            boxShadow: '0 20px 60px rgba(139, 69, 19, 0.2), inset 0 0 0 1px rgba(255,255,255,0.5)',
            borderRadius: 12,
            p: { xs: 3, md: 5 },
            position: 'relative',
            background: 'linear-gradient(135deg, #fffef9 0%, #fff8f0 100%)',
        },
        divider: {
            borderColor: '#d4a574',
            borderWidth: 2,
            my: 3,
            borderStyle: 'dashed',
        },
        chip: {
            backgroundColor: '#fff5e6',
            color: '#8b4513',
            borderColor: '#d4a574',
            borderWidth: 2,
            fontFamily: '"Courier New", monospace',
            fontWeight: 600,
            boxShadow: 'inset 0 1px 2px rgba(139, 69, 19, 0.1)',
        },
        chipVariant: 'outlined',
        sectionWrapper: {
            backgroundColor: '#fffef9',
            borderRadius: 6,
            border: '2px dashed #d4a574',
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,254,249,0.8) 0%, rgba(255,248,240,0.8) 100%)',
            boxShadow: 'inset 0 2px 4px rgba(139, 69, 19, 0.05)',
        },
        titleVariant: 'h3',
        textColor: '#5d4037',
        subtextColor: '#8b6f47',
        accentColor: '#c44569',
    },
    TECH_DOCS: {
        container: {
            backgroundColor: '#fdfcf7',
            minHeight: '100vh',
            py: 8,
        },
        paper: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '5px solid #2563eb',
            borderRadius: 0,
            p: { xs: 3, md: 5 },
            boxShadow: '0 30px 50px rgba(15,23,42,0.08)',
        },
        divider: {
            borderColor: '#2563eb33',
            my: 3,
        },
        chip: {
            backgroundColor: '#e0edff',
            color: '#1d4ed8',
            borderColor: '#2563eb',
        },
        chipVariant: 'filled',
        sectionWrapper: {
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            backgroundColor: '#f8fafc',
            p: 2,
        },
        titleVariant: 'h2',
        textColor: '#0f172a',
        subtextColor: '#475569',
        headerAddon: (
            <Box
                sx={{
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    pb: 2,
                }}
            >
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1d4ed8' }}>
                    # CV SPECIFICATION
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>v1.0 • Generated</Typography>
            </Box>
        ),
    },
};

export default function PublicCvPage() {
    const { username } = useParams<{ username: string }>();
    const [resume, setResume] = useState<PublicResumeDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (!username) return;

        const loadResume = async () => {
            try {
                setLoading(true);
                const data = await api.profile.getPublic(username);
                setResume(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Помилка завантаження');
            } finally {
                setLoading(false);
            }
        };

        loadResume();
    }, [username]);

    const templateTheme = useMemo<TemplateTheme>(() => {
        const baseTheme = resume?.template && templateStyles[resume.template]
            ? templateStyles[resume.template]
            : templateStyles.MINIMAL;

        if (!isDarkMode) {
            return baseTheme;
        }

        // Спеціальна темна версія для ретро шаблону
        if (resume?.template === 'RETRO') {
            return {
                ...baseTheme,
                container: {
                    background: 'linear-gradient(135deg, #2d1b1b 0%, #3d2b2b 50%, #1b2d2d 100%)',
                    minHeight: '100vh',
                    py: 8,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 69, 19, 0.1) 2px, rgba(139, 69, 19, 0.1) 4px),
                            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 69, 19, 0.1) 2px, rgba(139, 69, 19, 0.1) 4px)
                        `,
                        pointerEvents: 'none',
                    },
                },
                paper: {
                    backgroundColor: '#2a1f1f',
                    border: '3px double #8b5a3c',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(139, 90, 60, 0.3)',
                    borderRadius: 12,
                    p: { xs: 3, md: 5 },
                    position: 'relative',
                    background: 'linear-gradient(135deg, #2a1f1f 0%, #1f1a1a 100%)',
                    color: '#e8d5c4',
                },
                divider: {
                    borderColor: '#8b5a3c',
                    borderWidth: 2,
                    my: 3,
                    borderStyle: 'dashed',
                },
                chip: {
                    backgroundColor: '#3d2b2b',
                    color: '#e8d5c4',
                    borderColor: '#8b5a3c',
                    borderWidth: 2,
                    fontFamily: '"Courier New", monospace',
                    fontWeight: 600,
                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
                },
                sectionWrapper: {
                    backgroundColor: '#2a1f1f',
                    borderRadius: 6,
                    border: '2px dashed #8b5a3c',
                    p: 2,
                    background: 'linear-gradient(135deg, rgba(42, 31, 31, 0.8) 0%, rgba(31, 26, 26, 0.8) 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                },
                textColor: '#e8d5c4',
                subtextColor: 'rgba(232, 213, 196, 0.7)',
                accentColor: '#c44569',
            };
        }

        // Темна версія для інших шаблонів
        return {
            ...baseTheme,
            container: {
                background: 'linear-gradient(135deg,#0f172a 0%, #1f2937 100%)',
                minHeight: '100vh',
                py: 8,
            },
            paper: {
                ...baseTheme.paper,
                backgroundColor: '#1f2933',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                color: '#e2e8f0',
            },
            divider: {
                ...baseTheme.divider,
                borderColor: 'rgba(148,163,184,0.4)',
            },
            chip: {
                ...baseTheme.chip,
                backgroundColor: 'rgba(147,197,253,0.14)',
                color: '#e0f2fe',
                borderColor: 'rgba(96,165,250,0.6)',
            },
            sectionWrapper: {
                ...baseTheme.sectionWrapper,
                backgroundColor: 'rgba(15,23,42,0.35)',
            },
            textColor: '#e2e8f0',
            subtextColor: 'rgba(226,232,240,0.7)',
        };
    }, [resume?.template, isDarkMode]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Завантаження...</Typography>
            </Container>
        );
    }

    if (error || !resume) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Alert severity="error">
                    {error || 'Резюме не знайдено'}
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ ...templateTheme.container, color: templateTheme.textColor }}>
            <Container maxWidth="md">
                <Paper sx={templateTheme.paper}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Tooltip title={isDarkMode ? 'Світла тема' : 'Темна тема'}>
                            <IconButton
                                onClick={() => setIsDarkMode((prev) => !prev)}
                                sx={{
                                    color: templateTheme.textColor,
                                    border: `1px solid ${isDarkMode ? 'rgba(148,163,184,0.4)' : 'rgba(0,0,0,0.1)'}`,
                                    backgroundColor: isDarkMode ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(148,163,184,0.2)' : 'rgba(0,0,0,0.1)',
                                    },
                                }}
                            >
                                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {templateTheme.headerAddon}
                    <Box sx={{ mb: 3, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                        {resume.photo && (
                            <Box
                                component="img"
                                src={resume.photo.startsWith('data:') ? resume.photo : `data:image/jpeg;base64,${resume.photo}`}
                                alt={resume.fullName || 'Profile'}
                                sx={{
                                    width: { xs: 100, sm: 140 },
                                    height: { xs: 100, sm: 140 },
                                    borderRadius: 2,
                                    objectFit: 'cover',
                                    border: `2px solid ${templateTheme.accentColor || 'rgba(148,163,184,0.2)'}`,
                                    boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant={templateTheme.titleVariant} component="h1" gutterBottom>
                                {resume.fullName || 'Без імені'}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: templateTheme.subtextColor }}>
                                @{resume.username}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={templateTheme.divider} />

                    {resume.bio && (
                        <Box sx={{ mb: 4, ...(templateTheme.sectionWrapper ?? {}) }}>
                            <Typography variant="h6" gutterBottom>
                                Про себе
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ whiteSpace: 'pre-wrap', color: templateTheme.subtextColor }}
                            >
                                {resume.bio}
                            </Typography>
                        </Box>
                    )}

                    {resume.skills && resume.skills.length > 0 && (
                        <Box sx={{ mb: 4, ...(templateTheme.sectionWrapper ?? {}) }}>
                            <Typography variant="h6" gutterBottom>
                                Навички
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {resume.skills.map((skill, index) => (
                                    <Chip
                                        key={index}
                                        label={skill}
                                        variant={templateTheme.chipVariant}
                                        sx={templateTheme.chip}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {resume.projects && resume.projects.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Проєкти
                            </Typography>
                            <Stack spacing={3}>
                                {resume.projects.map((project, index) => (
                                    <Paper
                                        key={index}
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            bgcolor: templateTheme.sectionWrapper?.backgroundColor ?? 'transparent',
                                            borderColor: templateTheme.sectionWrapper?.borderColor ?? 'rgba(148,163,184,0.3)',
                                            color: 'inherit',
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            {project.name || 'Без назви'}
                                        </Typography>
                                        {project.description && (
                                            <Typography
                                                variant="body2"
                                                sx={{ mb: 1, whiteSpace: 'pre-wrap', color: templateTheme.subtextColor }}
                                            >
                                                {project.description}
                                            </Typography>
                                        )}
                                        {project.url && (
                                            <MuiLink
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2"
                                                sx={{ color: templateTheme.accentColor ?? templateTheme.textColor }}
                                            >
                                                {project.url}
                                            </MuiLink>
                                        )}
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

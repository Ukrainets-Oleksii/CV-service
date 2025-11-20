import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Stack,
    Chip,
    Alert,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../api/client';
import type { ResumeDto, ProjectDto, TemplateType } from '../api/client';

export default function EditorPage() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [template, setTemplate] = useState<TemplateType>('MINIMAL');
    const [publicUrl, setPublicUrl] = useState('');
    const [shareMessage, setShareMessage] = useState<string | null>(null);
    const [isEditorDark, setIsEditorDark] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadResume().catch((err) => {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : 'Помилка завантаження');
            setLoading(false);
        });
    }, [isAuthenticated, navigate]);

    const loadResume = async () => {
        try {
            setLoading(true);
            const resume = await api.profile.getOwn();
            setFullName(resume.fullName || '');
            setBio(resume.bio || '');
            setSkills(resume.skills || []);
            setProjects(resume.projects || []);
            setTemplate(resume.template || 'MINIMAL');
            setPublicUrl(resume.publicUrl || '');
            // Додаємо префікс data: якщо його немає, щоб уникнути інтерпретації base64 як URL
            setPhoto(resume.photo 
                ? (resume.photo.startsWith('data:') 
                    ? resume.photo 
                    : `data:image/jpeg;base64,${resume.photo}`)
                : null);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : 'Помилка завантаження резюме');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter((s) => s !== skill));
    };

    const handleAddProject = () => {
        setProjects([...projects, { name: '', description: '', url: '' }]);
    };

    const handleUpdateProject = (index: number, field: keyof ProjectDto, value: string) => {
        const updated = [...projects];
        updated[index] = { ...updated[index], [field]: value };
        setProjects(updated);
    };

    const handleRemoveProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index));
    };

    const buildShareLink = () => {
        if (!publicUrl) {
            return `${window.location.origin}/u`;
        }
        const segments = publicUrl.split('/').filter(Boolean);
        const usernameSegment = segments[segments.length - 1];
        if (!usernameSegment) {
            return `${window.location.origin}/u`;
        }
        return `${window.location.origin}/u/${usernameSegment}`;
    };

    const handleShareLink = async () => {
        const shareLink = buildShareLink();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareLink);
            } else {
                throw new Error('Clipboard API недоступний');
            }
            setShareMessage('Посилання на публічне резюме скопійовано');
            setTimeout(() => setShareMessage(null), 3000);
        } catch {
            setError('Не вдалося скопіювати посилання. Спробуйте вручну: ' + shareLink);
        }
    };

    const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Перевірка розміру (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Фото занадто велике. Максимальний розмір: 5MB');
            return;
        }

        // Перевірка типу
        if (!file.type.startsWith('image/')) {
            setError('Будь ласка, виберіть файл зображення');
            return;
        }

        try {
            setUploadingPhoto(true);
            setError(null);

            // Функція для адаптивного зменшення фото
            const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            // Завжди зменшуємо, якщо розмір файлу більше 1MB або розміри більші за maxWidth/maxHeight
                            // Це гарантує, що base64 не буде занадто великим
                            if (img.width <= maxWidth && img.height <= maxHeight && file.size < 1 * 1024 * 1024) {
                                const base64 = (e.target?.result as string).split(',')[1];
                                resolve(base64);
                                return;
                            }

                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            // Обчислюємо нові розміри зі збереженням пропорцій
                            if (width > height) {
                                if (width > maxWidth) {
                                    height = (height * maxWidth) / width;
                                    width = maxWidth;
                                }
                            } else {
                                if (height > maxHeight) {
                                    width = (width * maxHeight) / height;
                                    height = maxHeight;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;

                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                reject(new Error('Не вдалося створити canvas context'));
                                return;
                            }

                            ctx.drawImage(img, 0, 0, width, height);
                            const base64 = canvas.toDataURL('image/jpeg', quality);
                            const base64Data = base64.split(',')[1];
                            resolve(base64Data);
                        };
                        img.onerror = reject;
                        img.src = e.target?.result as string;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            };

            // Зменшуємо до 800x800 з якістю 0.85 (для уникнення помилки 431)
            // Це достатньо для профільного фото, яке відображається як 120-140px
            const base64 = await resizeImage(file, 800, 800, 0.85);

            // Перевірка розміру base64 (макс ~1.5MB в base64)
            const base64SizeKB = (base64.length * 3) / 4 / 1024;
            if (base64SizeKB > 1500) {
                // Якщо все ще велике, зменшуємо ще більше
                const smallerBase64 = await resizeImage(file, 600, 600, 0.8);
                await api.profile.uploadPhoto(smallerBase64);
                setPhoto(`data:image/jpeg;base64,${smallerBase64}`);
            } else {
                await api.profile.uploadPhoto(base64);
                setPhoto(`data:image/jpeg;base64,${base64}`);
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : 'Помилка завантаження фото');
        } finally {
            setUploadingPhoto(false);
            // Очищаємо input, щоб можна було вибрати той самий файл знову
            event.target.value = '';
        }
    };

    const handleDeletePhoto = async () => {
        try {
            setUploadingPhoto(true);
            setError(null);
            await api.profile.deletePhoto();
            setPhoto(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : 'Помилка видалення фото');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const editorTheme = useMemo(
        () =>
            isEditorDark
                ? {
                      background: '#0f172a',
                      text: '#f8fafc',
                      card: '#1f2933',
                      border: '1px solid rgba(148,163,184,0.35)',
                      chip: {
                          backgroundColor: 'rgba(59,130,246,0.18)',
                          color: '#bfdbfe',
                      },
                      input: {
                          color: '#f8fafc',
                          backgroundColor: '#111826',
                          borderColor: 'rgba(148,163,184,0.4)',
                          labelColor: 'rgba(248,250,252,0.75)',
                      },
                  }
                : {
                      background: '#f5f7fb',
                      text: '#0f172a',
                      card: '#ffffff',
                      border: '1px solid rgba(15,23,42,0.05)',
                      chip: {
                          backgroundColor: '#e0edff',
                          color: '#1d4ed8',
                      },
                      input: {
                          color: '#0f172a',
                          backgroundColor: '#ffffff',
                          borderColor: 'rgba(15,23,42,0.15)',
                          labelColor: 'rgba(15,23,42,0.7)',
                      },
                  },
        [isEditorDark]
    );

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const resumeData: ResumeDto = {
            fullName,
                bio,
            skills,
                projects,
                template,
            };

            await api.profile.update(resumeData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : 'Помилка збереження');
        } finally {
            setSaving(false);
        }
    };

    const handleTemplateChange = async (newTemplate: TemplateType) => {
        setTemplate(newTemplate);
        try {
            await api.profile.updateTemplate({ template: newTemplate });
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : 'Помилка оновлення шаблону');
        }
    };

    if (loading) {
        return (
            <Box sx={{ backgroundColor: editorTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="md" sx={{ textAlign: 'center', color: editorTheme.text }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Завантаження...</Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ backgroundColor: editorTheme.background, minHeight: '100vh', py: 6, color: editorTheme.text }}>
            <Container maxWidth="md">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="h4" component="h1">
                        Редактор резюме
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleShareLink}
                            startIcon={<ShareIcon />}
                            disabled={!publicUrl}
                        >
                            Поділитися
                        </Button>
                        <Button variant="outlined" onClick={logout}>
                            Вийти
                        </Button>
                        <Tooltip title={isEditorDark ? 'Світла тема' : 'Темна тема'}>
                            <IconButton
                                onClick={() => setIsEditorDark((prev) => !prev)}
                                sx={{
                                    border: '1px solid rgba(148,163,184,0.4)',
                                    color: editorTheme.text,
                                }}
                            >
                                {isEditorDark ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {shareMessage && (
                    <Alert severity="info" sx={{ mb: 2 }} onClose={() => setShareMessage(null)}>
                        {shareMessage}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
                        Резюме успішно збережено!
                    </Alert>
                )}

                <Paper
                    elevation={isEditorDark ? 0 : 3}
                    sx={{
                        p: 4,
                        backgroundColor: editorTheme.card,
                        color: editorTheme.text,
                        border: editorTheme.border,
                        boxShadow: isEditorDark ? '0 30px 60px rgba(0,0,0,0.35)' : undefined,
                    }}
                >
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: editorTheme.text }}>
                            Фото профілю
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: isEditorDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.02)',
                                border: `1px solid ${isEditorDark ? 'rgba(148,163,184,0.2)' : 'rgba(0,0,0,0.1)'}`,
                            }}
                        >
                            {photo ? (
                                <>
                                    <Box
                                        component="img"
                                        src={photo}
                                        alt="Profile"
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 2,
                                            objectFit: 'cover',
                                            border: `2px solid ${isEditorDark ? 'rgba(148,163,184,0.3)' : 'rgba(0,0,0,0.1)'}`,
                                        }}
                                    />
                                    <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="photo-upload-input"
                                            type="file"
                                            onChange={handlePhotoSelect}
                                            disabled={uploadingPhoto}
                                        />
                                        <label htmlFor="photo-upload-input">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                disabled={uploadingPhoto}
                                                startIcon={<PhotoCameraIcon />}
                                                sx={{
                                                    color: editorTheme.text,
                                                    borderColor: editorTheme.input.borderColor,
                                                    '&:hover': {
                                                        borderColor: editorTheme.input.borderColor,
                                                        backgroundColor: isEditorDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)',
                                                    },
                                                }}
                                            >
                                                {uploadingPhoto ? 'Завантаження...' : 'Замінити'}
                                            </Button>
                                        </label>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleDeletePhoto}
                                            disabled={uploadingPhoto}
                                            startIcon={<DeleteIcon />}
                                            sx={{
                                                borderColor: isEditorDark ? 'rgba(239,68,68,0.5)' : undefined,
                                                color: isEditorDark ? '#fca5a5' : undefined,
                                            }}
                                        >
                                            Видалити
                                        </Button>
                                    </Stack>
                                </>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 2,
                                            backgroundColor: isEditorDark ? 'rgba(15,23,42,0.6)' : 'rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px dashed ${isEditorDark ? 'rgba(148,163,184,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                        }}
                                    >
                                        <PhotoCameraIcon
                                            sx={{
                                                fontSize: 48,
                                                color: isEditorDark ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.3)',
                                            }}
                                        />
                                    </Box>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="photo-upload-input"
                                        type="file"
                                        onChange={handlePhotoSelect}
                                        disabled={uploadingPhoto}
                                    />
                                    <label htmlFor="photo-upload-input">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            disabled={uploadingPhoto}
                                            startIcon={<PhotoCameraIcon />}
                                            sx={{
                                                color: editorTheme.text,
                                                borderColor: editorTheme.input.borderColor,
                                                '&:hover': {
                                                    borderColor: editorTheme.input.borderColor,
                                                    backgroundColor: isEditorDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)',
                                                },
                                            }}
                                        >
                                            {uploadingPhoto ? 'Завантаження...' : 'Завантажити фото'}
                                        </Button>
                                    </label>
                                </>
                            )}
                        </Box>
                        <Typography variant="caption" sx={{ color: editorTheme.input.labelColor }}>
                            Рекомендований розмір: квадратне зображення. Максимальний розмір файлу: 5MB
                        </Typography>
                    </Box>

                    <Divider />

                    <TextField
                        fullWidth
                        label="Ім'я та прізвище"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        variant="outlined"
                            InputProps={{
                                sx: {
                                    color: editorTheme.input.color,
                                    backgroundColor: editorTheme.input.backgroundColor,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: editorTheme.input.borderColor,
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: editorTheme.input.labelColor },
                            }}
                    />

                    <TextField
                        fullWidth
                        label="Біографія / Про себе"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        multiline
                        rows={4}
                        variant="outlined"
                            InputProps={{
                                sx: {
                                    color: editorTheme.input.color,
                                    backgroundColor: editorTheme.input.backgroundColor,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: editorTheme.input.borderColor,
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: editorTheme.input.labelColor },
                            }}
                    />

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Навички
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <TextField
                                label="Додати навичку"
                                size="small"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSkill();
                                    }
                                }}
                                sx={{ flexGrow: 1 }}
                                InputProps={{
                                    sx: {
                                        color: editorTheme.input.color,
                                        backgroundColor: editorTheme.input.backgroundColor,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: editorTheme.input.borderColor,
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { color: editorTheme.input.labelColor },
                                }}
                            />
                            <Button variant="outlined" onClick={handleAddSkill}>
                                Додати
                            </Button>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {skills.map((skill) => (
                                <Chip
                                    key={skill}
                                    label={skill}
                                    onDelete={() => handleRemoveSkill(skill)}
                                    sx={{
                                        backgroundColor: editorTheme.chip.backgroundColor,
                                        color: editorTheme.chip.color,
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Проєкти</Typography>
                            <Button variant="outlined" size="small" onClick={handleAddProject}>
                                Додати проєкт
                            </Button>
                        </Box>
                        {projects.map((project, index) => (
                            <Paper
                                key={index}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    backgroundColor: isEditorDark ? '#111826' : '#fefefe',
                                    borderColor: isEditorDark ? 'rgba(148,163,184,0.3)' : undefined,
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ color: editorTheme.input.labelColor, fontWeight: 600 }}
                                    >
                                        Проєкт {index + 1}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveProject(index)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="Назва проєкту"
                                        size="small"
                                        value={project.name}
                                        onChange={(e) => handleUpdateProject(index, 'name', e.target.value)}
                                        InputProps={{
                                            sx: {
                                                color: editorTheme.input.color,
                                                backgroundColor: editorTheme.input.backgroundColor,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: editorTheme.input.borderColor,
                                                },
                                            },
                                        }}
                                        InputLabelProps={{
                                            sx: { color: editorTheme.input.labelColor },
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Опис"
                                        size="small"
                                        multiline
                                        rows={2}
                                        value={project.description}
                                        onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
                                        InputProps={{
                                            sx: {
                                                color: editorTheme.input.color,
                                                backgroundColor: editorTheme.input.backgroundColor,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: editorTheme.input.borderColor,
                                                },
                                            },
                                        }}
                                        InputLabelProps={{
                                            sx: { color: editorTheme.input.labelColor },
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="URL"
                                        size="small"
                                        value={project.url}
                                        onChange={(e) => handleUpdateProject(index, 'url', e.target.value)}
                                        InputProps={{
                                            sx: {
                                                color: editorTheme.input.color,
                                                backgroundColor: editorTheme.input.backgroundColor,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: editorTheme.input.borderColor,
                                                },
                                            },
                                        }}
                                        InputLabelProps={{
                                            sx: { color: editorTheme.input.labelColor },
                                        }}
                                    />
                                </Stack>
                            </Paper>
                        ))}
                    </Box>

                    <Divider />

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: editorTheme.input.labelColor }}>Шаблон</InputLabel>
                        <Select
                            value={template}
                            label="Шаблон"
                            onChange={(e) => handleTemplateChange(e.target.value as TemplateType)}
                            sx={{
                                color: editorTheme.input.color,
                                backgroundColor: editorTheme.input.backgroundColor,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: editorTheme.input.borderColor,
                                },
                                '.MuiSelect-icon': { color: editorTheme.input.color },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: editorTheme.card,
                                        color: editorTheme.text,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="MINIMAL">Мінімалістичний</MenuItem>
                            <MenuItem value="RETRO">Ретро</MenuItem>
                            <MenuItem value="TECH_DOCS">Технічна документація</MenuItem>
                        </Select>
                    </FormControl>

                        <Button
                            type="button"
                            variant="contained"
                            size="large"
                            onClick={handleSave}
                            disabled={saving}
                            sx={{ mt: 2 }}
                        >
                            {saving ? <CircularProgress size={24} /> : 'Зберегти резюме'}
                        </Button>
                </Box>
            </Paper>
        </Container>
        </Box>
    );
}

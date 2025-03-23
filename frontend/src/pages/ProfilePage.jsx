import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Grid, 
    Avatar,
    TextField,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    Snackbar,
    Alert,
    Divider,
    AppBar,
    Toolbar,
    IconButton,
    Chip
} from '@mui/material';
import { 
    Edit as EditIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    ArrowBack as ArrowBackIcon,
    CloudUpload as CloudUploadIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { 
    getUserProfile, 
    updateUserProfile, 
    uploadProfileImage, 
    getProfileImageUrl 
} from '../services/profileService';

function ProfilePage({ account }) {
    const [profile, setProfile] = useState({
        name: "",
        profileImageCID: "",
        location: "",
        contact: "",
        role: 0
    });
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const navigate = useNavigate();
    

    useEffect(() => {
        if (!account) {
            navigate("/");
            return;
        }
        
        fetchUserProfile();
    }, [account, navigate]);
    
    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const userProfile = await getUserProfile(account);
            setProfile(userProfile);
            if (userProfile.profileImageCID) {
                setProfileImagePreview(getProfileImageUrl(userProfile.profileImageCID));
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setSnackbar({
                open: true,
                message: "Error loading profile. Please try again.",
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };
    
    const handleEdit = () => {
        setIsEditing(true);
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        fetchUserProfile(); // Reset to original values
    };
    
    const handleSave = async () => {
        setSaving(true);
        try {
            // If a new image is selected, upload it first
            if (profileImage) {
                try {
                    setUploadingImage(true);
                    const cid = await uploadProfileImage(profileImage);
                    profile.profileImageCID = cid;
                } catch (imageError) {
                    console.error("Error uploading image:", imageError);
                    setSnackbar({
                        open: true,
                        message: `Error uploading image: ${imageError.message}`,
                        severity: 'error'
                    });
                    setSaving(false);
                    return;
                } finally {
                    setUploadingImage(false);
                }
            }
            
            // Update profile on blockchain
            await updateUserProfile(profile, account);
            
            setSnackbar({
                open: true,
                message: "Profile updated successfully!",
                severity: 'success'
            });
            
            setIsEditing(false);
            // Refresh profile
            fetchUserProfile();
        } catch (error) {
            console.error("Error saving profile:", error);
            setSnackbar({
                open: true,
                message: `Error updating profile: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setSaving(false);
        }
    };
    
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(file);
            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    
    const handleBack = () => {
        // Redirect based on user role
        if (profile.role === 1) { // Farmer
            navigate("/farmer-dashboard");
        } else if (profile.role === 2) { // Buyer
            navigate("/buyer-dashboard");
        } else {
            navigate("/");
        }
    };
    
    const getRoleName = (role) => {
        switch (role) {
            case 1:
                return "Farmer";
            case 2:
                return "Buyer";
            default:
                return "Unregistered";
        }
    };
    
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Farm Assure - User Profile
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                            avatar={<Avatar><PersonIcon /></Avatar>}
                            label={account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}
                            variant="outlined"
                            sx={{ mr: 2, bgcolor: 'white' }}
                        />
                        <IconButton color="inherit" onClick={() => navigate("/")}>
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    User Profile
                                </Typography>
                                <Chip 
                                    label={getRoleName(profile.role)} 
                                    color={profile.role === 1 ? 'success' : 'primary'} 
                                    sx={{ mb: 2 }}
                                />
                            </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                                    <Avatar 
                                        src={profileImagePreview} 
                                        sx={{ 
                                            width: 150, 
                                            height: 150, 
                                            mb: 2,
                                            boxShadow: 2
                                        }}
                                    />
                                    
                                    {isEditing && (
                                        <Box sx={{ mt: 2, width: '100%' }}>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<CloudUploadIcon />}
                                                fullWidth
                                                sx={{ mb: 1 }}
                                            >
                                                Choose Profile Image
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </Button>
                                            
                                            {profileImage && (
                                                <Typography variant="caption" color="primary">
                                                    New image selected: {profileImage.name}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    
                                    
                                    <Typography variant="h5" component="h2" sx={{ mt: 2 }}>
                                        {profile.name || "No Name Set"}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {account}
                                    </Typography>
                                    
                                    <Divider sx={{ width: '100%', my: 2 }} />
                                    
                                    {!isEditing ? (
                                        <Button
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={handleEdit}
                                            fullWidth
                                        >
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<SaveIcon />}
                                                onClick={handleSave}
                                                disabled={saving || uploadingImage}
                                                fullWidth
                                            >
                                                {(saving || uploadingImage) ? <CircularProgress size={24} /> : 'Save Changes'}
                                            </Button>
                                            
                                            <Button
                                                variant="outlined"
                                                onClick={handleCancel}
                                                disabled={saving || uploadingImage}
                                                fullWidth
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        Profile Information
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Full Name"
                                                name="name"
                                                value={profile.name}
                                                onChange={handleInputChange}
                                                fullWidth
                                                disabled={!isEditing}
                                                variant={isEditing ? "outlined" : "filled"}
                                                InputProps={{
                                                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                }}
                                            />
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Location"
                                                name="location"
                                                value={profile.location}
                                                onChange={handleInputChange}
                                                fullWidth
                                                disabled={!isEditing}
                                                variant={isEditing ? "outlined" : "filled"}
                                                InputProps={{
                                                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                }}
                                            />
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Contact Information"
                                                name="contact"
                                                value={profile.contact}
                                                onChange={handleInputChange}
                                                fullWidth
                                                disabled={!isEditing}
                                                variant={isEditing ? "outlined" : "filled"}
                                                InputProps={{
                                                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                }}
                                                helperText="Email or phone number"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Container>
            
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ProfilePage; 
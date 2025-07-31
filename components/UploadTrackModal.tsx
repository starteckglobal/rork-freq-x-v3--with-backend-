import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
  ProgressBarAndroid
} from 'react-native';
import { X, Upload, Image as ImageIcon, Music, Calendar, Tag, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import { defaultCoverArt } from '@/constants/images';
import StyledInput from '@/components/StyledInput';
import StyledButton from '@/components/StyledButton';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserStore } from '@/store/user-store';
import { usePlayerStore } from '@/store/player-store';
import { analytics } from '@/services/analytics';
import { firebaseStorage, UploadProgress } from '@/services/firebase-storage';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Track } from '@/types/audio';
import { generateId } from '@/utils/id';

interface UploadTrackModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (trackId: string) => void;
  initialPlaylistId?: string;
}

// Define a proper type for errors
interface FormErrors {
  title?: string;
  artist?: string;
  genre?: string;
  audioFile?: string;
  coverImage?: string;
  [key: string]: string | undefined;
}

export default function UploadTrackModal({ 
  visible, 
  onClose, 
  onSuccess,
  initialPlaylistId 
}: UploadTrackModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<any>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState(false);
  const [duration, setDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  
  const { currentUser } = useUserStore();
  const { addUploadedTrack, refreshMusicLibrary } = usePlayerStore();
  const { initializeAnonymous } = useFirebaseAuth();
  const uploadTaskRef = useRef<any>(null);
  
  // Reset form when modal is opened/closed
  useEffect(() => {
    if (visible) {
      resetForm();
      if (currentUser) {
        setArtist(currentUser.displayName);
      }
    }
  }, [visible, currentUser]);
  
  const resetForm = () => {
    setTitle('');
    if (currentUser) {
      setArtist(currentUser.displayName);
    } else {
      setArtist('');
    }
    setGenre('');
    setReleaseDate(new Date());
    setCoverImage(null);
    setAudioFile(null);
    setIsPrivate(false);
    setErrors({});
    setFormTouched(false);
    setDuration(0);
    setUploadProgress(null);
    setUploadState('idle');
    setUploadError(null);
    setCanCancel(false);
    uploadTaskRef.current = null;
  };
  
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      
      if (!result.canceled) {
        setCoverImage(result.assets[0].uri);
        // Fixed: Use proper type for errors
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.coverImage;
          return newErrors;
        });
        setFormTouched(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  
  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
        const selectedFile = result.assets[0];
        
        // Validate file before setting
        const validation = firebaseStorage.validateMusicFile(selectedFile);
        if (!validation.isValid) {
          Alert.alert('Invalid File', validation.error || 'Please select a valid audio file');
          return;
        }
        
        setAudioFile(selectedFile);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.audioFile;
          return newErrors;
        });
        setFormTouched(true);
        
        // Estimate duration based on file size (rough approximation)
        // In a real app, you would extract actual duration from audio metadata
        const fileSizeInMB = (selectedFile.size || 0) / (1024 * 1024);
        const estimatedDuration = Math.max(120, Math.min(600, Math.floor(fileSizeInMB * 60))); // 2-10 minutes
        setDuration(estimatedDuration);
        
        console.log('Selected audio file:', {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.mimeType,
          estimatedDuration
        });
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to select audio file');
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = 'Track title is required';
      isValid = false;
    }
    
    if (!artist.trim()) {
      newErrors.artist = 'Artist name is required';
      isValid = false;
    }
    
    if (!genre.trim()) {
      newErrors.genre = 'Genre is required';
      isValid = false;
    }
    
    if (!audioFile) {
      newErrors.audioFile = 'Audio file is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleUpload = async () => {
    if (!validateForm()) return;
    
    if (!currentUser?.id) {
      Alert.alert('Error', 'You must be logged in to upload tracks');
      return;
    }
    
    setIsLoading(true);
    setUploadState('uploading');
    setUploadError(null);
    setCanCancel(true);
    
    try {
      console.log('Starting upload process...');
      
      // Initialize Firebase authentication if needed
      console.log('Initializing Firebase authentication...');
      const authResult = await initializeAnonymous();
      if (authResult.error) {
        console.error('Firebase auth initialization failed:', authResult.error);
        throw new Error(`Authentication failed: ${authResult.error}`);
      }
      console.log('Firebase authentication initialized successfully');
      
      // Upload cover image first if provided
      let coverImageUrl = defaultCoverArt;
      if (coverImage) {
        console.log('Uploading cover image...');
        const coverImageResult = await firebaseStorage.upload(
          `covers/${currentUser.id}/${Date.now()}.jpg`,
          await (await fetch(coverImage)).blob()
        );
        
        if (coverImageResult.error) {
          throw new Error(`Cover image upload failed: ${coverImageResult.error}`);
        }
        
        coverImageUrl = coverImageResult.url || defaultCoverArt;
        console.log('Cover image uploaded:', coverImageUrl);
      }
      
      // Upload audio file with progress tracking
      console.log('Uploading audio file...');
      const uploadResult = await firebaseStorage.uploadMusic(
        audioFile,
        {
          title,
          artist,
          genre,
          userId: currentUser.id
        },
        {
          onProgress: (progress: UploadProgress) => {
            console.log('Upload progress:', progress.progress.toFixed(1) + '%');
            setUploadProgress(progress);
          },
          onStateChange: (state: string) => {
            console.log('Upload state changed:', state);
            if (state === 'success') {
              setCanCancel(false);
            }
          }
        }
      );
      
      if (uploadResult.error) {
        console.error('Upload result error:', uploadResult.error);
        throw new Error(uploadResult.error);
      }
      
      if (!uploadResult.url) {
        console.error('Upload completed but no URL received. Upload result:', uploadResult);
        throw new Error('Upload completed but no URL received. This may be a Firebase configuration issue.');
      }
      
      console.log('Upload successful! URL:', uploadResult.url);
      
      console.log('Audio file uploaded successfully:', uploadResult.url);
      
      // Create track object
      const trackId = generateId();
      const newTrack: Track = {
        id: trackId,
        title,
        artist,
        artistId: currentUser.id,
        coverArt: coverImageUrl,
        audioUrl: uploadResult.url,
        duration,
        plays: 0,
        likes: 0,
        genre: genre || 'Unknown',
        releaseDate: releaseDate.toISOString().split('T')[0],
        description: `Uploaded by ${artist}`,
        waveformData: Array.from({ length: 100 }, () => Math.random()),
        isExplicit: false
      };
      
      // Add to uploaded tracks
      addUploadedTrack(newTrack);
      
      // Refresh music library
      await refreshMusicLibrary();
      
      // Track analytics event
      analytics.track('track_uploaded', {
        user_id: currentUser.id,
        track_id: trackId,
        track_title: title,
        track_artist: artist,
        genre: genre,
        duration: duration,
        is_private: isPrivate,
        has_cover_image: !!coverImage,
        file_size: audioFile?.size || 0,
        added_to_playlist: !!initialPlaylistId,
      });
      
      setUploadState('success');
      setIsLoading(false);
      setCanCancel(false);
      
      console.log('Upload completed successfully!');
      
      // Show success message
      Alert.alert(
        "Upload Successful!",
        `"${title}" has been uploaded and is now available in your music library. You can play it immediately!`,
        [{ 
          text: "Play Now", 
          onPress: () => {
            const { playTrack } = usePlayerStore.getState();
            playTrack(newTrack);
            resetForm();
            if (onSuccess) {
              onSuccess(trackId);
            }
            onClose();
          }
        }, {
          text: "OK", 
          onPress: () => {
            resetForm();
            if (onSuccess) {
              onSuccess(trackId);
            }
            onClose();
          }
        }]
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState('error');
      setUploadError(error.message || 'Upload failed');
      setIsLoading(false);
      setCanCancel(false);
      
      let errorMessage = error.message || 'Failed to upload track. Please check your internet connection and try again.';
      let showRetry = true;
      
      // Handle specific Firebase errors
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        errorMessage = 'Upload permission denied. This may be due to Firebase configuration. Please check the Firebase setup documentation.';
        showRetry = false;
      } else if (error.message?.includes('Authentication failed')) {
        errorMessage = 'Authentication failed. Please restart the app and try again.';
      } else if (error.message?.includes('no URL received')) {
        errorMessage = 'Upload completed but failed to get file URL. This may be a temporary issue.';
      }
      
      const alertButtons = showRetry ? [
        { text: 'Retry', onPress: handleUpload },
        { text: 'Cancel', style: 'cancel' as const }
      ] : [
        { text: 'OK', style: 'cancel' as const }
      ];
      
      Alert.alert('Upload Failed', errorMessage, alertButtons);
    }
  };
  
  const handleCancelUpload = () => {
    if (uploadTaskRef.current && canCancel) {
      Alert.alert(
        'Cancel Upload',
        'Are you sure you want to cancel the upload?',
        [
          { text: 'Continue Upload', style: 'cancel' },
          { 
            text: 'Cancel Upload', 
            style: 'destructive',
            onPress: () => {
              if (uploadTaskRef.current) {
                firebaseStorage.cancelUpload(uploadTaskRef.current);
              }
              setUploadState('idle');
              setUploadProgress(null);
              setIsLoading(false);
              setCanCancel(false);
            }
          }
        ]
      );
    }
  };
  
  const confirmClose = () => {
    if (uploadState === 'uploading') {
      Alert.alert(
        "Upload in Progress",
        "Your track is currently uploading. Are you sure you want to cancel?",
        [
          { text: "Continue Upload", style: "cancel" },
          { text: "Cancel Upload", style: "destructive", onPress: () => {
            if (uploadTaskRef.current && canCancel) {
              firebaseStorage.cancelUpload(uploadTaskRef.current);
            }
            resetForm();
            onClose();
          }}
        ]
      );
    } else if (formTouched) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to close?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => {
            resetForm();
            onClose();
          }}
        ]
      );
    } else {
      onClose();
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReleaseDate(selectedDate);
      setFormTouched(true);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const renderUploadProgress = () => {
    if (!uploadProgress || uploadState !== 'uploading') return null;
    
    return (
      <View style={styles.uploadProgressContainer}>
        <View style={styles.uploadProgressHeader}>
          <Text style={styles.uploadProgressTitle}>Uploading...</Text>
          <Text style={styles.uploadProgressPercent}>
            {uploadProgress.progress.toFixed(1)}%
          </Text>
        </View>
        
        <View style={[styles.progressBar, styles.progressBarContainer]}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${uploadProgress.progress}%` }
            ]} 
          />
        </View>
        
        <View style={styles.uploadProgressDetails}>
          <Text style={styles.uploadProgressText}>
            {formatFileSize(uploadProgress.bytesTransferred)} / {formatFileSize(uploadProgress.totalBytes)}
          </Text>
          {canCancel && (
            <TouchableOpacity onPress={handleCancelUpload} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  const renderUploadStatus = () => {
    if (uploadState === 'success') {
      return (
        <View style={styles.uploadStatusContainer}>
          <CheckCircle size={24} color={colors.success} />
          <Text style={styles.uploadStatusText}>Upload completed successfully!</Text>
        </View>
      );
    }
    
    if (uploadState === 'error' && uploadError) {
      return (
        <View style={styles.uploadStatusContainer}>
          <AlertCircle size={24} color={colors.error} />
          <Text style={[styles.uploadStatusText, { color: colors.error }]}>
            {uploadError}
          </Text>
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={confirmClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Upload Track</Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={confirmClose}
                  disabled={isLoading}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                  <TouchableOpacity 
                    style={styles.coverImageContainer}
                    onPress={handlePickImage}
                    disabled={isLoading}
                  >
                    <Image 
                      source={{ uri: coverImage || defaultCoverArt }}
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                    <View style={styles.coverImageOverlay}>
                      <ImageIcon size={24} color={colors.text} />
                      <Text style={styles.coverImageText}>
                        {coverImage ? 'Change Cover' : 'Add Cover'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.audioFileContainer, audioFile ? styles.audioFileSelected : null]}
                    onPress={handlePickAudio}
                    disabled={isLoading || uploadState === 'uploading'}
                  >
                    <Music size={24} color={colors.text} />
                    <View style={styles.audioFileInfo}>
                      <Text style={styles.audioFileText}>
                        {audioFile ? audioFile.name : 'Select Audio File (MP3, WAV, MP4, M4A)'}
                      </Text>
                      {audioFile && (
                        <View style={styles.audioFileDetails}>
                          {duration > 0 && (
                            <View style={styles.durationContainer}>
                              <Clock size={14} color={colors.textSecondary} />
                              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
                            </View>
                          )}
                          {audioFile.size && (
                            <Text style={styles.fileSizeText}>
                              {formatFileSize(audioFile.size)}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {errors.audioFile && <Text style={styles.errorText}>{errors.audioFile}</Text>}
                  
                  {renderUploadProgress()}
                  {renderUploadStatus()}
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <StyledInput
                      placeholder="Track title"
                      value={title}
                      onChangeText={(text) => {
                        setTitle(text);
                        setFormTouched(true);
                        if (text.trim()) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.title;
                            return newErrors;
                          });
                        }
                      }}
                      maxLength={100}
                      editable={!isLoading}
                      containerStyle={styles.styledInputContainer}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Artist</Text>
                    <StyledInput
                      placeholder="Artist name"
                      value={artist}
                      onChangeText={(text) => {
                        setArtist(text);
                        setFormTouched(true);
                        if (text.trim()) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.artist;
                            return newErrors;
                          });
                        }
                      }}
                      maxLength={100}
                      editable={!isLoading}
                      containerStyle={styles.styledInputContainer}
                    />
                    {errors.artist && <Text style={styles.errorText}>{errors.artist}</Text>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Genre</Text>
                    <StyledInput
                      placeholder="Genre"
                      value={genre}
                      onChangeText={(text) => {
                        setGenre(text);
                        setFormTouched(true);
                        if (text.trim()) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.genre;
                            return newErrors;
                          });
                        }
                      }}
                      maxLength={50}
                      editable={!isLoading}
                      containerStyle={styles.styledInputContainer}
                    />
                    {errors.genre && <Text style={styles.errorText}>{errors.genre}</Text>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Release Date</Text>
                    <TouchableOpacity 
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                      disabled={isLoading}
                    >
                      <Text style={styles.dateText}>
                        {releaseDate.toLocaleDateString()}
                      </Text>
                      <Calendar size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={releaseDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </View>
                  
                  <View style={styles.privacyContainer}>
                    <View style={styles.privacyLabelContainer}>
                      <Text style={styles.inputLabel}>Privacy</Text>
                      <Text style={styles.privacyDescription}>
                        {isPrivate 
                          ? "Only you can see this track" 
                          : "Anyone can find and listen to this track"}
                      </Text>
                    </View>
                    <Switch
                      value={isPrivate}
                      onValueChange={(value) => {
                        setIsPrivate(value);
                        setFormTouched(true);
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.text}
                      disabled={isLoading}
                    />
                  </View>
                  
                  <View style={styles.uploadButtonContainer}>
                    <StyledButton
                      title={
                        uploadState === 'uploading' ? 'Uploading...' :
                        uploadState === 'success' ? 'Upload Complete!' :
                        isLoading ? 'Processing...' : 'Upload Track'
                      }
                      onPress={handleUpload}
                      disabled={
                        isLoading || 
                        uploadState === 'uploading' || 
                        uploadState === 'success' || 
                        !formTouched || 
                        !audioFile
                      }
                      style={[
                        uploadState === 'success' && styles.successButton,
                        uploadState === 'error' && styles.errorButton
                      ]}
                    />
                    {uploadState === 'uploading' && canCancel && (
                      <TouchableOpacity 
                        style={styles.cancelUploadButton}
                        onPress={handleCancelUpload}
                      >
                        <XCircle size={20} color={colors.error} />
                        <Text style={styles.cancelUploadText}>Cancel Upload</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  scrollView: {
    width: '100%',
  },
  form: {
    padding: 16,
  },
  coverImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  audioFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  audioFileSelected: {
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
  audioFileText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreContainer: {
    position: 'relative',
  },
  genreInput: {
    paddingRight: 40,
  },
  genreIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    color: colors.text,
    fontSize: 16,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  privacyLabelContainer: {
    flex: 1,
  },
  privacyDescription: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.cardElevated,
    opacity: 0.7,
  },
  styledInputContainer: {
    width: '100%',
    maxWidth: '100%',
  },
  uploadButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  audioFileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioFileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  fileSizeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  uploadProgressContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uploadProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadProgressTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadProgressPercent: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  progressBarContainer: {
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  uploadProgressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadProgressText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  uploadStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  uploadStatusText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  cancelUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 8,
  },
  cancelUploadText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
});
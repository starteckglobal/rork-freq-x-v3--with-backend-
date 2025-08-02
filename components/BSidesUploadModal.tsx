import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { X, Upload, CassetteTape, Crown, AlertCircle } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBSidesStore } from '@/store/bsides-store';

interface BSidesUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (title: string, description: string, file?: any) => void;
  onUpgrade?: () => void;
}

export default function BSidesUploadModal({ visible, onClose, onUpload, onUpgrade }: BSidesUploadModalProps) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { colors: themeColors } = useColorScheme();
  const { 
    canUpload, 
    getRemainingUploads, 
    getUploadLimit, 
    isSubscribed 
  } = useBSidesStore();
  const styles = createStyles(themeColors);
  
  const remainingUploads = getRemainingUploads();
  const uploadLimit = getUploadLimit();
  const isPaid = isSubscribed();
  const canUploadTrack = canUpload();

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your track');
      return;
    }

    if (!canUploadTrack) {
      Alert.alert(
        'Upload Limit Reached',
        'You\'ve reached your upload limit. Upgrade to upload more songs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => onUpgrade?.() }
        ]
      );
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUpload(title.trim(), description.trim());
      
      // Reset form
      setTitle('');
      setDescription('');
      
      Alert.alert('Success', 'Your B-side track has been uploaded successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload track. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = () => {
    // In a real app, this would open file picker
    Alert.alert(
      'Select Audio File',
      'Choose an audio file to upload',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'From Library', onPress: () => console.log('Select from library') },
        { text: 'Record New', onPress: () => console.log('Record new track') },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Upload B-side Track</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        {/* Upload Limit Status */}
        <View style={styles.limitStatus}>
          {!isPaid && (
            <View style={styles.limitInfo}>
              <View style={styles.limitHeader}>
                <Text style={styles.limitText}>
                  Uploads: {uploadLimit === Infinity ? '∞' : `${uploadLimit - remainingUploads}/${uploadLimit}`}
                </Text>
                {remainingUploads !== Infinity && (
                  <Text style={styles.remainingText}>
                    {remainingUploads} remaining
                  </Text>
                )}
              </View>
              
              {!canUploadTrack && (
                <View style={styles.limitReached}>
                  <AlertCircle size={16} color="#FF4444" />
                  <Text style={styles.limitReachedText}>
                    Upload limit reached. Upgrade to upload more songs.
                  </Text>
                  <TouchableOpacity 
                    style={styles.upgradeButton}
                    onPress={onUpgrade}
                  >
                    <Crown size={14} color={themeColors.text} />
                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          
          {isPaid && (
            <View style={styles.unlimitedBadge}>
              <Crown size={16} color={themeColors.primary} />
              <Text style={styles.unlimitedText}>Unlimited uploads</Text>
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.uploadSection}>
            <TouchableOpacity 
              style={styles.fileUploadButton}
              onPress={handleFileSelect}
              disabled={isUploading}
            >
              <CassetteTape size={32} color={themeColors.primary} />
              <Text style={styles.fileUploadText}>Select Audio File</Text>
              <Text style={styles.fileUploadSubtext}>MP3, WAV, M4A supported</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Track Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter track title"
                placeholderTextColor={themeColors.textSecondary}
                maxLength={100}
                editable={!isUploading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tell your fans about this exclusive track..."
                placeholderTextColor={themeColors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
                editable={!isUploading}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={isUploading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.uploadButton, 
                (isUploading || !canUploadTrack) && styles.uploadButtonDisabled
              ]} 
              onPress={handleUpload}
              disabled={isUploading || !title.trim() || !canUploadTrack}
            >
              <Upload size={16} color={themeColors.text} />
              <Text style={styles.uploadButtonText}>
                {isUploading ? 'Uploading...' : 
                 !canUploadTrack ? 'Limit Reached' : 'Upload Track'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  title: {
    color: themeColors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  uploadSection: {
    marginBottom: 24,
  },
  fileUploadButton: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: themeColors.border,
    borderStyle: 'dashed',
  },
  fileUploadText: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  fileUploadSubtext: {
    color: themeColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: themeColors.card,
    borderRadius: 8,
    padding: 12,
    color: themeColors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: themeColors.cardElevated,
  },
  cancelButtonText: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: themeColors.primary,
  },
  uploadButtonDisabled: {
    backgroundColor: themeColors.textSecondary,
    opacity: 0.6,
  },
  uploadButtonText: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  limitStatus: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  limitInfo: {
    backgroundColor: themeColors.card,
    borderRadius: 8,
    padding: 12,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitText: {
    color: themeColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  remainingText: {
    color: themeColors.textSecondary,
    fontSize: 12,
  },
  limitReached: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 6,
    padding: 8,
    gap: 8,
  },
  limitReachedText: {
    flex: 1,
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 4,
  },
  upgradeButtonText: {
    color: themeColors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  unlimitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.card,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  unlimitedText: {
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X, Upload, Music } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface BSidesUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (title: string, description: string, file?: any) => void;
}

export default function BSidesUploadModal({ visible, onClose, onUpload }: BSidesUploadModalProps) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your track');
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
            <X size={24} color={colors.text} />
          </TouchableOpacity>
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
              <Music size={32} color={colors.primary} />
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
                placeholderTextColor={colors.textSecondary}
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
                placeholderTextColor={colors.textSecondary}
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
              style={[styles.button, styles.uploadButton, isUploading && styles.uploadButtonDisabled]} 
              onPress={handleUpload}
              disabled={isUploading || !title.trim()}
            >
              <Upload size={16} color={colors.text} />
              <Text style={styles.uploadButtonText}>
                {isUploading ? 'Uploading...' : 'Upload Track'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  fileUploadText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  fileUploadSubtext: {
    color: colors.textSecondary,
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
    backgroundColor: colors.cardElevated,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: colors.primary,
  },
  uploadButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
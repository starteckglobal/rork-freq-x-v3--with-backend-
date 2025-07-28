import React, { useState, useEffect } from 'react';
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
import { X, Save, Music, Upload } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { BSideTrack } from '@/store/bsides-store';

interface BSidesEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (trackId: string, title: string, description: string, file?: any) => void;
  track: BSideTrack | null;
}

export default function BSidesEditModal({ visible, onClose, onSave, track }: BSidesEditModalProps) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    if (track) {
      setTitle(track.title);
      setDescription(track.description);
      setHasChanges(false);
    } else {
      setTitle('');
      setDescription('');
      setHasChanges(false);
    }
  }, [track, visible]);

  useEffect(() => {
    if (track) {
      const titleChanged = title !== track.title;
      const descriptionChanged = description !== track.description;
      setHasChanges(titleChanged || descriptionChanged);
    }
  }, [title, description, track]);

  const handleSave = async () => {
    if (!track) return;
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your track');
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate save process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(track.id, title.trim(), description.trim());
      
      Alert.alert('Success', 'Your B-side track has been updated successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update track. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileReplace = () => {
    Alert.alert(
      'Replace Audio File',
      'Choose a new audio file to replace the current one',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'From Library', onPress: () => console.log('Select from library') },
        { text: 'Record New', onPress: () => console.log('Record new track') },
      ]
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  if (!track) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit B-side Track</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.currentFileSection}>
            <View style={styles.currentFileInfo}>
              <Music size={24} color={colors.primary} />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName}>Current Audio File</Text>
                <Text style={styles.fileSubtext}>Uploaded {new Date(track.uploadedAt).toLocaleDateString()}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.replaceFileButton}
              onPress={handleFileReplace}
              disabled={isSaving}
            >
              <Upload size={16} color={colors.primary} />
              <Text style={styles.replaceFileText}>Replace</Text>
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
                editable={!isSaving}
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
                editable={!isSaving}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.saveButton, 
                (!hasChanges || isSaving) && styles.saveButtonDisabled
              ]} 
              onPress={handleSave}
              disabled={isSaving || !title.trim() || !hasChanges}
            >
              <Save size={16} color={colors.text} />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
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
  currentFileSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  fileSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  replaceFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  replaceFileText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
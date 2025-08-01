import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Volume2, RotateCcw, Save } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Slider from '@/components/Slider';
import StyledButton from '@/components/StyledButton';
import { settingsService } from '@/services/settings';
import createContextHook from '@nkzw/create-context-hook';

const FREQUENCY_BANDS = [
  { label: '60Hz', frequency: 60 },
  { label: '770Hz', frequency: 770 },
  { label: '310Hz', frequency: 310 },
  { label: '600Hz', frequency: 600 },
  { label: '1kHz', frequency: 1000 },
  { label: '3kHz', frequency: 3000 },
  { label: '6kHz', frequency: 6000 },
  { label: '12kHz', frequency: 12000 },
  { label: '14kHz', frequency: 14000 },
  { label: '16kHz', frequency: 16000 },
];

const PRESETS = {
  flat: { name: 'Flat', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  rock: { name: 'Rock', values: [4, 3, -1, -2, 1, 2, 3, 4, 4, 4] },
  pop: { name: 'Pop', values: [-1, 2, 4, 4, 1, -1, -1, -1, 2, 3] },
  jazz: { name: 'Jazz', values: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3] },
  classical: { name: 'Classical', values: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4] },
};

interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  bandValues: number[];
  customValues: number[];
}

// Equalizer Context
export const [EqualizerProvider, useEqualizer] = createContextHook(() => {
  const [settings, setSettings] = useState<EqualizerSettings>({
    enabled: false,
    preset: 'flat',
    bandValues: PRESETS.flat.values,
    customValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on initialization
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const playbackSettings = await settingsService.getPlaybackSettings();
      
      // Load custom equalizer settings from AsyncStorage
      const customSettings = await AsyncStorage.getItem('equalizer_settings');
      let equalizerData: EqualizerSettings;
      
      if (customSettings) {
        const parsed = JSON.parse(customSettings);
        equalizerData = {
          enabled: playbackSettings.equalizerEnabled,
          preset: playbackSettings.equalizerPreset,
          bandValues: parsed.bandValues || PRESETS.flat.values,
          customValues: parsed.customValues || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        };
      } else {
        equalizerData = {
          enabled: playbackSettings.equalizerEnabled,
          preset: playbackSettings.equalizerPreset,
          bandValues: PRESETS[playbackSettings.equalizerPreset as keyof typeof PRESETS]?.values || PRESETS.flat.values,
          customValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        };
      }
      
      setSettings(equalizerData);
    } catch (error) {
      console.error('Failed to load equalizer settings:', error);
      setSettings({
        enabled: false,
        preset: 'flat',
        bandValues: PRESETS.flat.values,
        customValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: EqualizerSettings) => {
    try {
      // Save to settings service
      await settingsService.updatePlaybackSettings({
        equalizerEnabled: newSettings.enabled,
        equalizerPreset: newSettings.preset,
      });
      
      // Save custom equalizer data to AsyncStorage
      await AsyncStorage.setItem('equalizer_settings', JSON.stringify({
        bandValues: newSettings.bandValues,
        customValues: newSettings.customValues,
      }));
      
      setSettings(newSettings);
      console.log('Equalizer settings saved successfully');
    } catch (error) {
      console.error('Failed to save equalizer settings:', error);
      throw error;
    }
  };

  const updateEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    await saveSettings(newSettings);
  };

  const updatePreset = async (preset: string) => {
    let bandValues: number[];
    
    if (preset === 'custom') {
      bandValues = settings.customValues;
    } else {
      bandValues = PRESETS[preset as keyof typeof PRESETS]?.values || PRESETS.flat.values;
    }
    
    const newSettings = { ...settings, preset, bandValues };
    await saveSettings(newSettings);
  };

  const updateBandValue = async (index: number, value: number) => {
    const newBandValues = [...settings.bandValues];
    newBandValues[index] = value;
    
    const newCustomValues = [...newBandValues];
    
    const newSettings = {
      ...settings,
      preset: 'custom',
      bandValues: newBandValues,
      customValues: newCustomValues,
    };
    
    await saveSettings(newSettings);
  };

  const resetToFlat = async () => {
    const newSettings = {
      ...settings,
      preset: 'flat',
      bandValues: PRESETS.flat.values,
    };
    await saveSettings(newSettings);
  };

  return {
    settings,
    isLoading,
    updateEnabled,
    updatePreset,
    updateBandValue,
    resetToFlat,
    saveSettings,
  };
});

// Add AsyncStorage import
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EqualizerScreen() {
  const router = useRouter();
  const { settings, isLoading, updateEnabled, updatePreset, updateBandValue, resetToFlat } = useEqualizer();
  const [isSaving, setIsSaving] = useState(false);

  const handleBandChange = async (index: number, value: number) => {
    try {
      await updateBandValue(index, value);
    } catch (error) {
      console.error('Failed to update band value:', error);
      Alert.alert('Error', 'Failed to update equalizer setting');
    }
  };

  const handlePresetSelect = async (presetKey: string) => {
    try {
      await updatePreset(presetKey);
    } catch (error) {
      console.error('Failed to update preset:', error);
      Alert.alert('Error', 'Failed to apply preset');
    }
  };

  const handleToggleEnabled = async () => {
    try {
      await updateEnabled(!settings.enabled);
    } catch (error) {
      console.error('Failed to toggle equalizer:', error);
      Alert.alert('Error', 'Failed to toggle equalizer');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Equalizer',
      'Are you sure you want to reset all bands to flat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await resetToFlat();
            } catch (error) {
              console.error('Failed to reset equalizer:', error);
              Alert.alert('Error', 'Failed to reset equalizer');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Settings are already saved automatically, this is just for user feedback
      Alert.alert(
        'Success',
        'Your equalizer settings have been saved and will persist across app restarts',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save equalizer settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading equalizer settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Equalizer',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <RotateCcw size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Enable/Disable Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleLeft}>
              <Volume2 size={24} color={colors.primary} />
              <Text style={styles.toggleTitle}>Equalizer</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, settings.enabled && styles.toggleEnabled]}
              onPress={handleToggleEnabled}
            >
              <View style={[styles.toggleThumb, settings.enabled && styles.toggleThumbEnabled]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.toggleDescription}>
            Enhance your audio experience with custom frequency adjustments
          </Text>
        </View>

        {settings.enabled && (
          <>
            {/* Presets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Presets</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsContainer}>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.presetButton,
                      settings.preset === key && styles.presetButtonSelected
                    ]}
                    onPress={() => handlePresetSelect(key)}
                  >
                    <Text style={[
                      styles.presetButtonText,
                      settings.preset === key && styles.presetButtonTextSelected
                    ]}>
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.presetButton,
                    settings.preset === 'custom' && styles.presetButtonSelected
                  ]}
                >
                  <Text style={[
                    styles.presetButtonText,
                    settings.preset === 'custom' && styles.presetButtonTextSelected
                  ]}>
                    Custom
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Frequency Bands */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequency Bands</Text>
              <View style={styles.equalizerContainer}>
                {/* dB Scale Labels */}
                <View style={styles.scaleContainer}>
                  <Text style={styles.scaleLabel}>+12dB</Text>
                  <Text style={styles.scaleLabel}>0dB</Text>
                  <Text style={styles.scaleLabel}>-12dB</Text>
                </View>
                
                {/* Frequency Bands */}
                <View style={styles.bandsContainer}>
                  {FREQUENCY_BANDS.map((band, index) => (
                    <View key={band.frequency} style={styles.bandContainer}>
                      <View style={styles.sliderContainer}>
                        {/* Current dB Value */}
                        <Text style={styles.gainValue}>
                          {settings.bandValues[index] > 0 ? '+' : ''}{settings.bandValues[index]}dB
                        </Text>
                        
                        {/* Vertical Slider */}
                        <View style={styles.sliderWrapper}>
                          <Slider
                            value={settings.bandValues[index]}
                            onValueChange={(value) => handleBandChange(index, Math.round(value))}
                            minimumValue={-12}
                            maximumValue={12}
                            step={1}
                            vertical={true}
                            style={styles.slider}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                          />
                        </View>
                        
                        {/* Frequency Label */}
                        <Text style={styles.frequencyLabel}>{band.label}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>How to Use</Text>
              <Text style={styles.infoText}>
                • Drag sliders up to boost frequencies (+dB)
              </Text>
              <Text style={styles.infoText}>
                • Drag sliders down to reduce frequencies (-dB)
              </Text>
              <Text style={styles.infoText}>
                • Use presets for quick adjustments
              </Text>
              <Text style={styles.infoText}>
                • Lower frequencies (left) control bass
              </Text>
              <Text style={styles.infoText}>
                • Higher frequencies (right) control treble
              </Text>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <StyledButton
                title={isSaving ? "Saving..." : "Save Settings"}
                onPress={handleSave}
                style={styles.saveButton}
                disabled={isSaving}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  resetButton: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleEnabled: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.text,
  },
  toggleThumbEnabled: {
    alignSelf: 'flex-end',
  },
  toggleDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  presetsContainer: {
    flexDirection: 'row',
  },
  presetButton: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  presetButtonSelected: {
    backgroundColor: colors.primary,
  },
  presetButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  presetButtonTextSelected: {
    color: '#FFF',
  },
  equalizerContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scaleContainer: {
    position: 'absolute',
    left: 0,
    top: 24,
    height: 140,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    zIndex: 1,
  },
  scaleLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  bandsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    width: '100%',
    paddingLeft: 40,
  },
  bandContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 32,
  },
  sliderContainer: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'space-between',
  },
  gainValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    minHeight: 16,
    textAlign: 'center',
    minWidth: 32,
  },
  sliderWrapper: {
    height: 140,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    height: 140,
    width: 24,
  },
  frequencyLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    minWidth: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    padding: 16,
  },
  saveButton: {
    marginBottom: 16,
  },
});
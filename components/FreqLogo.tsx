import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ImageStyle, ViewStyle, TextStyle } from 'react-native';
import { freqLogoUrl, freqLogoFallback, freqLogoAlternatives } from '@/constants/images';
import { colors } from '@/constants/colors';

interface FreqLogoProps {
  size?: number;
  style?: ImageStyle | ViewStyle;
  showText?: boolean;
  textStyle?: TextStyle;
}

export default function FreqLogo({ 
  size = 60, 
  style, 
  showText = false, 
  textStyle 
}: FreqLogoProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const imageUrls = [freqLogoUrl, ...freqLogoAlternatives, freqLogoFallback];

  const handleImageError = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const handleImageLoad = () => {
    setHasError(false);
  };

  if (hasError) {
    // Final fallback - render a styled text logo
    return (
      <View style={[
        styles.fallbackContainer, 
        { width: size, height: size },
        style
      ]}>
        <Text style={[
          styles.fallbackText, 
          { fontSize: size * 0.24 },
          textStyle
        ]}>
          FREQ
        </Text>
        {showText && (
          <Text style={[styles.brandText, textStyle]}>
            FREQ
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri: imageUrls[currentImageIndex] }}
        style={[
          styles.logo,
          { width: size, height: size }
        ]}
        onError={handleImageError}
        onLoad={handleImageLoad}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.brandText, textStyle]}>
          FREQ
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 8,
  },
  fallbackContainer: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  brandText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});
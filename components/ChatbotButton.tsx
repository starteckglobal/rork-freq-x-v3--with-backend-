import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useChatbotStore } from '@/store/chatbot-store';
import { colors } from '@/constants/colors';

interface ChatbotButtonProps {
  bottomOffset?: number;
}

export default function ChatbotButton({ bottomOffset = 100 }: ChatbotButtonProps) {
  const { setIsOpen } = useChatbotStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Create glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={[styles.container, { bottom: bottomOffset + 20 }]}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />
      
      {/* Main button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setIsOpen(true)}
        >
          <MessageCircle size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2B4BF2',
    top: -5,
    left: -5,
  },
  buttonContainer: {
    width: 50,
    height: 50,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2B4BF2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B4BF2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#1A3AD8',
  },
});
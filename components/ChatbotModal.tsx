import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { X, Send, Sparkles } from 'lucide-react-native';
import { useChatbotStore } from '@/store/chatbot-store';
import { colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { freqLogoUrl } from '@/constants/images';

export default function ChatbotModal() {
  const { isOpen, setIsOpen, messages, addMessage, isLoading, setIsLoading } = useChatbotStore();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors: currentColors } = useColorScheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setIsLoading(true);

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are FREQY, an expert music assistant for artists. You help with:
              
              🎵 Music Theory: Chords, scales, progressions, harmony, rhythm
              🎼 Songwriting: Lyrics, melody, structure, arrangement
              🎤 Artist Development: Career advice, branding, marketing
              🎧 Production: Recording tips, mixing, mastering basics
              📈 Industry Insights: Trends, opportunities, rollout strategies
              🎹 Instruments: Playing techniques, gear recommendations
              📚 Music History: Genres, influential artists, cultural context
              
              Keep responses helpful, creative, and encouraging. Use music terminology appropriately and provide actionable advice.`,
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content: userMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response
      addMessage({
        role: 'assistant',
        content: data.completion,
      });
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsOpen(false)}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <Image 
                source={{ uri: freqLogoUrl }} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: currentColors.text }]}>
                FREQY
              </Text>
              <Text style={[styles.headerSubtitle, { color: currentColors.textSecondary }]}>
                Your creative music companion
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={() => setIsOpen(false)}
          >
            <X size={24} color={currentColors.text} />
          </Pressable>
        </View>

        {/* Messages */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[styles.messagesContent, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Image 
                  source={{ uri: freqLogoUrl }} 
                  style={styles.welcomeLogoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.welcomeTitle, { color: currentColors.text }]}>
                Welcome to FREQY! 🎵
              </Text>
              <Text style={[styles.welcomeText, { color: currentColors.textSecondary }]}>
                I'm here to help with music theory, songwriting, artist development, and more. Ask me anything about music!
              </Text>
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionsTitle, { color: currentColors.text }]}>
                  Try asking:
                </Text>
                {[
                  "What chord progression works well for a sad ballad?",
                  "How do I plan an album rollout strategy?",
                  "Explain the circle of fifths",
                  "What are current music industry trends?"
                ].map((suggestion, index) => (
                  <Pressable
                    key={index}
                    style={[styles.suggestionButton, { borderColor: currentColors.border }]}
                    onPress={() => setInputText(suggestion)}
                  >
                    <Text style={[styles.suggestionText, { color: currentColors.textSecondary }]}>
                      "{suggestion}"
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.assistantIcon}>
                  <Image 
                    source={{ uri: freqLogoUrl }} 
                    style={styles.assistantLogoImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user'
                    ? { backgroundColor: currentColors.primary }
                    : { backgroundColor: currentColors.card },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    {
                      color: message.role === 'user' ? '#FFFFFF' : currentColors.text,
                    },
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    {
                      color: message.role === 'user' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : currentColors.textTertiary,
                    },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.assistantIcon}>
                <Image 
                  source={{ uri: freqLogoUrl }} 
                  style={styles.assistantLogoImage}
                  resizeMode="contain"
                />
              </View>
              <View style={[styles.messageBubble, { backgroundColor: currentColors.card }]}>
                <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
                  FREQY is thinking...
                </Text>
              </View>
            </View>
          )}
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Input */}
        <View style={[styles.inputContainer, { borderTopColor: currentColors.border, backgroundColor: currentColors.background }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: currentColors.card,
                color: currentColors.text,
                borderColor: currentColors.border,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about music theory, songwriting, or anything music-related..."
            placeholderTextColor={currentColors.textTertiary}
            multiline
            maxLength={1000}
            editable={!isLoading}
            textAlignVertical="top"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2B4BF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2B4BF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  welcomeLogoImage: {
    width: 48,
    height: 48,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2B4BF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  assistantLogoImage: {
    width: 22,
    height: 22,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 20,
    borderTopWidth: 1,
    minHeight: 72,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 12,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2B4BF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
});
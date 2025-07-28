import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { X, Crown, Music, Upload, Users, Star } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface BSidesSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export default function BSidesSubscriptionModal({ visible, onClose, onSubscribe }: BSidesSubscriptionModalProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubscribe();
      Alert.alert('Success', 'Welcome to B-sides! You can now upload exclusive content for your fans.');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>B-sides Premium</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Music size={48} color={colors.primary} />
              <Crown size={24} color={colors.primary} style={styles.crownIcon} />
            </View>
            <Text style={styles.heroTitle}>Unlock B-sides</Text>
            <Text style={styles.heroSubtitle}>
              Share exclusive content with your most dedicated fans
            </Text>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceText}>$9.99</Text>
            <Text style={styles.priceSubtext}>per month</Text>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What you get:</Text>
            
            <View style={styles.feature}>
              <Upload size={20} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Exclusive Uploads</Text>
                <Text style={styles.featureDescription}>
                  Upload unreleased tracks, demos, and behind-the-scenes content
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Users size={20} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Fan Engagement</Text>
                <Text style={styles.featureDescription}>
                  Connect with your most dedicated supporters through exclusive content
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Star size={20} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Premium Badge</Text>
                <Text style={styles.featureDescription}>
                  Show off your B-sides creator status with a special badge
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.subscribeButton, isProcessing && styles.subscribeButtonDisabled]} 
              onPress={handleSubscribe}
              disabled={isProcessing}
            >
              <Crown size={20} color={colors.text} />
              <Text style={styles.subscribeButtonText}>
                {isProcessing ? 'Processing...' : 'Subscribe for $9.99/month'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Cancel anytime. Subscription will auto-renew monthly. 
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </View>
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
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  crownIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceText: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: '700',
  },
  priceSubtext: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  subscribeButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  disclaimer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
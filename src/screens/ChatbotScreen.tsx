import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Animated as RNAnimated,
} from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import API_BASE_URL from '../config/api';
import theme from '../theme/theme';

// TypeScript Interfaces
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatbotScreen: React.FC = () => {
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  // State with TypeScript types
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    text: 'Hello! I am your AgriAI Assistant. How can I help you today?',
    isUser: false,
    timestamp: new Date()
  }]);

  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

  // Generate a unique ID for messages
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Add a new message to the chat
  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: generateId(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Scroll to bottom after adding a message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    // Use a short delay to ensure the new message is rendered
    const scrollTimeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // Check if the backend server is reachable and test the simple-response endpoint
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        console.log('Checking server connection...');

        // Test the simple-response endpoint with a basic query
        console.log('Testing simple-response endpoint...');
        const testResponse = await axios.post(`${API_BASE_URL}/simple-response`, {
          message: 'test connection'
        });
        console.log('simple-response test result:', testResponse.data);
        console.log('Server is reachable!');
      } catch (error) {
        console.error('Server connection error:', error);
        // Add a message to the chat about the connection issue
        const newMessage: Message = {
          id: generateId(),
          text: "I'm having trouble connecting to the server. Please check if the backend is running on port 8000.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    // Run the check when component mounts
    checkServerConnection();
  }, []);

  // Format response text
  const formatResponse = (text: string): string => {
    let formatted = text
      .replace(/(\d+\.\s)/g, '\n\n$1')
      .replace(/:\s/g, ':\n')
      .replace(/-\n/g, '-')
      .replace(/\(\s*(\d+)\.\s*(\d+)-\s*(\d+)\.\s*(\d+)\)/g, '($1.$2-$3.$4)')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\n(?=\d)/g, ' ');
    return formatted.trim();
  };

  // Start speech recognition
  const startListening = async () => {
    try {
      setListening(true);

      // In a real app, you would integrate with a speech-to-text API here
      // For this demo, we'll simulate speech recognition with a random farming question
      const farmingQuestions = [
        "How do I treat tomato blight?",
        "What's the best time to plant corn?",
        "How can I improve soil drainage?",
        "What crops grow well in clay soil?",
        "How to prevent pest infestation naturally?"
      ];

      // Play a sound to indicate listening
      Speech.speak('Listening...', {
        rate: 1.2,
        pitch: 1.0,
      });

      // Simulate processing time
      setTimeout(() => {
        // Pick a random question
        const randomQuestion = farmingQuestions[Math.floor(Math.random() * farmingQuestions.length)];

        // Set the input text to the random question
        setInputText(randomQuestion);
        setListening(false);

        // Automatically send the question after a short delay
        setTimeout(() => {
          // Use the randomQuestion directly to avoid race conditions with state updates
          addMessage(randomQuestion, true);

          // Show loading state
          setLoading(true);

          // Hide suggestions after first question
          setShowSuggestions(false);

          // Send the API request
          axios.post(`${API_BASE_URL}/get-response`, {
            query: randomQuestion || '' // Changed from 'message' to 'query'
          })
            .then(res => {
              if (res.data && res.data.response) {
                const formattedResponse = formatResponse(res.data.response);
                addMessage(formattedResponse, false);
              } else {
                addMessage("I'm sorry, I received an invalid response format. Please try again.", false);
              }
            })
            .catch(error => {
              console.error('Error generating response:', error);
              addMessage("I'm sorry, an error occurred. Please try again.", false);
            })
            .finally(() => {
              setLoading(false);
            });
        }, 500);

      }, 2000);
    } catch (error) {
      setListening(false);
      Alert.alert('Error', 'Failed to start speech recognition.');
      console.error('Speech recognition error:', error);
    }
  };

  // Stop speech recognition
  const stopListening = async () => {
    try {
      await Speech.stop();
      setListening(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  // Reset input - kept for future use
  // const resetInput = () => {
  //   setInputText('');
  //   stopListening();
  // };

  // Speak the response
  const speakResponse = async (text: string) => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      setIsSpeaking(false);
      console.error('Error speaking response:', error);
    }
  };

  // Clear the chat history
  const clearChat = () => {
    setMessages([{
      id: '0',
      text: 'Hello! I am your AgriAI Assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }]);
    setInputText('');
    setShowSuggestions(true);
  };

  // Generate AI response
  const handleGenerateResponse = async () => {
    if (!inputText.trim()) {
      Alert.alert('Input Required', 'Please enter some text first.');
      return;
    }

    // Add user message to chat
    addMessage(inputText, true);

    // Clear input field
    const userQuery = inputText;
    setInputText('');

    // Hide suggestions after first question
    setShowSuggestions(false);

    // Show loading state
    setLoading(true);

    try {
      console.log('Sending request to:', `${API_BASE_URL}/get-response`);
      console.log('Request payload:', { query: userQuery });

      // First try the get-response endpoint
      try {
        const res = await axios.post(`${API_BASE_URL}/get-response`, {
          query: userQuery || '' // Changed from 'message' to 'query'
        });

        console.log('Response received:', res.data);

        if (res.data && res.data.response) {
          const formattedResponse = formatResponse(res.data.response);

          // Add AI response to chat
          addMessage(formattedResponse, false);
          return; // Exit early if successful
        } else {
          console.error('Invalid response format from get-response:', res.data);
          // Continue to fallback
        }
      } catch (getResponseError) {
        console.error('Error with get-response endpoint:', getResponseError);
        // Continue to fallback
      }

      // Fallback to simple-response endpoint if get-response fails
      try {
        console.log('Trying fallback to simple-response endpoint');
        const fallbackRes = await axios.post(`${API_BASE_URL}/simple-response`, {
          message: userQuery || ''
        });

        console.log('Fallback response received:', fallbackRes.data);

        if (fallbackRes.data && fallbackRes.data.response) {
          const formattedResponse = formatResponse(fallbackRes.data.response);

          // Add AI response to chat
          addMessage(formattedResponse, false);
        } else {
          console.error('Invalid response format from simple-response:', fallbackRes.data);
          addMessage("I'm sorry, I received an invalid response format. Please try again.", false);
        }
      } catch (fallbackError) {
        console.error('Error with fallback endpoint:', fallbackError);

        if (axios.isAxiosError(fallbackError)) {
          if (fallbackError.response) {
            // Server responded with an error status code
            console.error('Response data:', fallbackError.response.data);
            console.error('Response status:', fallbackError.response.status);

            const errorMessage = fallbackError.response.data?.detail ||
              `Server error (${fallbackError.response.status}): Please try again later.`;

            addMessage(`I'm sorry, I encountered an error: ${errorMessage}`, false);
          } else if (fallbackError.request) {
            // Request was made but no response received
            console.error('No response received:', fallbackError.request);
            addMessage("I'm sorry, I didn't receive a response from the server. Please check your internet connection and try again.", false);
          } else {
            // Error in setting up the request
            console.error('Request setup error:', fallbackError.message);
            addMessage("I'm sorry, there was an error setting up the request. Please try again.", false);
          }
        } else {
          // Non-Axios error
          console.error('Non-Axios error:', fallbackError);
          addMessage("I'm sorry, an unexpected error occurred. Please try again.", false);
        }
      }
    } catch (error) {
      console.error('Unexpected error in handleGenerateResponse:', error);
      addMessage("I'm sorry, an unexpected error occurred. Please try again.", false);
    } finally {
      setLoading(false);
    }
  };

  // Suggested questions for farmers
  const suggestions = [
    "What crops are suitable for sandy soil?",
    "How to prevent tomato leaf diseases?",
    "Best practices for organic farming?",
    "How to improve soil fertility naturally?",
    "When is the best time to plant wheat?",
    "How to control pests organically?",
    "Best irrigation methods for vegetables?",
    "How to increase crop yield?"
  ];

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);

    // Automatically send the message after a short delay
    setTimeout(() => {
      // Just use the handleGenerateResponse function to handle the suggestion
      // This ensures consistent behavior and error handling
      addMessage(suggestion, true);
      setShowSuggestions(false);
      setLoading(true);

      // Use the same API call logic as handleGenerateResponse
      axios.post(`${API_BASE_URL}/get-response`, {
        query: suggestion || '' // Changed from 'message' to 'query'
      })
        .then(res => {
          if (res.data && res.data.response) {
            const formattedResponse = formatResponse(res.data.response);
            addMessage(formattedResponse, false);
          } else {
            console.error('Invalid response format from get-response:', res.data);
            // Try fallback to simple-response
            return axios.post(`${API_BASE_URL}/simple-response`, {
              message: suggestion || ''
            });
          }
        })
        .then(fallbackRes => {
          if (fallbackRes && fallbackRes.data && fallbackRes.data.response) {
            const formattedResponse = formatResponse(fallbackRes.data.response);
            addMessage(formattedResponse, false);
          }
        })
        .catch(error => {
          console.error('Error generating response:', error);
          addMessage("I'm sorry, an error occurred. Please try again.", false);
        })
        .finally(() => {
          setLoading(false);
          setInputText('');
        });
    }, 300);
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          style={styles.header}
        >
          <Animated.View entering={FadeIn.delay(300).duration(800)}>
            <Text style={styles.title}>AgriAI Assistant</Text>
            <Text style={styles.subtitle}>Your farming knowledge companion</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <Animated.View
            key={message.id}
            entering={message.id === '0' ? FadeInDown.delay(300).duration(500) :
                     message.isUser ? FadeInRight.duration(300) : FadeInDown.duration(300)}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <View style={styles.messageHeader}>
              {!message.isUser && (
                <Ionicons name="leaf" size={16} color={theme.colors.primary} style={styles.messageIcon} />
              )}
              <Text style={styles.messageSender}>
                {message.isUser ? 'You' : 'AgriAI'}
              </Text>
              <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
            </View>

            <Text style={styles.messageText}>{message.text}</Text>

            {!message.isUser && (
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakResponse(message.text)}
              >
                <Ionicons
                  name={isSpeaking ? "volume-mute" : "volume-medium"}
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </Animated.View>
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <RNAnimated.View
              style={[
                styles.pulsingDot,
                { transform: [{ scale: pulseAnim }] }
              ]}
            />
            <Text style={styles.loadingText}>AgriAI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      {showSuggestions && (
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try asking about:</Text>
          <View style={styles.suggestionsContent}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionClick(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question here..."
          placeholderTextColor={theme.colors.textLight}
          multiline
          maxLength={500}
          onSubmitEditing={() => {
            if (inputText.trim()) {
              handleGenerateResponse();
            } else {
              Keyboard.dismiss();
            }
          }}
        />

        <View style={styles.inputActions}>
          <TouchableOpacity
            style={[styles.actionButton, listening && styles.activeButton]}
            onPress={listening ? stopListening : startListening}
            disabled={loading}
          >
            {listening ? (
              <RNAnimated.View
                style={{
                  transform: [{ scale: pulseAnim }]
                }}
              >
                <Ionicons
                  name="mic"
                  size={24}
                  color={theme.colors.card}
                />
              </RNAnimated.View>
            ) : (
              <Ionicons
                name="mic-outline"
                size={24}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton, !inputText.trim() && styles.disabledButton]}
            onPress={handleGenerateResponse}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.card} size="small" />
            ) : (
              <Ionicons name="send" size={24} color={theme.colors.card} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.footerButton} onPress={clearChat}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.footerButtonText}>Clear Chat</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.md,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: '700',
    color: theme.colors.card,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.card,
    opacity: 0.9,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  userBubble: {
    backgroundColor: theme.colors.primaryLight,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  aiBubble: {
    backgroundColor: theme.colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  messageIcon: {
    marginRight: theme.spacing.xs,
  },
  messageSender: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  messageTime: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
  },
  messageText: {
    fontSize: theme.typography.fontSizes.md,
    lineHeight: 22,
    color: theme.colors.text,
  },
  speakButton: {
    alignSelf: 'flex-end',
    padding: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  suggestionsContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  suggestionsTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  suggestionsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    ...theme.shadows.sm,
  },
  suggestionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.md,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.md,
    maxHeight: 120,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  inputActions: {
    flexDirection: 'row',
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  footerButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
});

export default ChatbotScreen;

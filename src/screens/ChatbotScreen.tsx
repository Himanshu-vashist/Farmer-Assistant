import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

// TypeScript Interfaces
interface HistoryItem {
  question: string;
  answer: string;
}

const Assistant: React.FC = () => {
  // State with TypeScript types
  const [transcript, setTranscript] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

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
      const { isSpeaking } = await Speech.speak('Listening...', {
        onDone: () => {
          // Start speech recognition here
          // Note: Expo's Speech module doesn't support speech-to-text
          // You might want to use expo-speech-recognition (available in SDK 49+)
          setListening(false);
        },
      });
    } catch (error) {
      setListening(false);
      Alert.alert('Error', 'Failed to start speech recognition.');
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

  // Reset input
  const resetInput = () => {
    setTranscript('');
    setInputText('');
    stopListening();
  };

  // Generate AI response
  const handleGenerateResponse = async () => {
    const userInput = transcript || inputText;
    if (!userInput.trim()) {
      Alert.alert('Input Required', 'Please speak or enter some text first.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/get-response', { text: userInput });
      const formattedResponse = formatResponse(res.data.response);
      setResponse(formattedResponse);
      setHistory((prev) => [...prev, { question: userInput, answer: formattedResponse }]);
    } catch (error) {
      console.error('Error generating response:', error);
      Alert.alert('Error', 'Failed to generate AI response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AgriAI Assistant</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* History Section */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.sectionTitle}>History</Text>
            <FontAwesome
              name={showHistory ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>
          {showHistory && (
            <View style={styles.historyList}>
              {history.length === 0 ? (
                <Text style={styles.placeholder}>No history yet.</Text>
              ) : (
                history.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyItem}
                    onPress={() => setResponse(item.answer)}
                  >
                    <Text style={styles.historyQuestion}>{item.question}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Response Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AI Response</Text>
          <View style={styles.responseContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : response ? (
              response.split('\n').map((line, i) => (
                <Text key={i} style={styles.responseLine}>
                  {line}
                </Text>
              ))
            ) : (
              <Text style={styles.placeholder}>AI response will appear here...</Text>
            )}
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.card}>
          <TextInput
            style={styles.textArea}
            value={transcript || inputText}
            onChangeText={setInputText}
            placeholder="Type or speak here..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, listening ? styles.buttonActive : {}]}
              onPress={listening ? stopListening : startListening}
            >
              <FontAwesome
                name="microphone"
                size={20}
                color={listening ? '#fff' : '#007AFF'}
              />
              <Text style={[styles.buttonText, listening ? styles.buttonTextActive : {}]}>
                {listening ? 'Listening...' : 'Speak'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={resetInput}>
              <FontAwesome name="refresh" size={20} color="#007AFF" />
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, loading ? styles.buttonDisabled : {}]}
              onPress={handleGenerateResponse}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FontAwesome name="bolt" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Get Response</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  historyQuestion: {
    fontSize: 16,
    color: '#333',
  },
  responseContainer: {
    minHeight: 100,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  responseLine: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
    borderColor: '#aaa',
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  buttonTextActive: {
    color: '#fff',
  },
});

export default Assistant;

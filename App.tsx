import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { AgriTradeProvider } from './src/services/AgriTrade';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AgriTradeProvider>
          <AppNavigator />
        </AgriTradeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;

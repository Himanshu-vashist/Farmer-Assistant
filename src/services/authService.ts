import { auth } from '../config/firebaseConfig';

export const authService = {
  getIdToken: async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    return await user.getIdToken();
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },

  isAuthenticated: () => {
    return !!auth.currentUser;
  }
};
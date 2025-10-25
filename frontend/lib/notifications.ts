"use client";

import { api } from './api';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

class NotificationService {
  private messaging: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Check if Firebase is available
      let firebaseAvailable = true;
      
      try {
        // Dynamically import Firebase
        const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
        const { initializeApp } = await import('firebase/app');

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(app);

        // Request permission and get token
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(this.messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token) {
            // Register device token with backend
            await this.registerDeviceToken(token);
          }

          // Listen for foreground messages
          onMessage(this.messaging, (payload) => {
            this.handleForegroundMessage(payload);
          });
        }
      } catch (firebaseError) {
        console.warn('Firebase not available, using fallback notifications:', firebaseError);
        firebaseAvailable = false;
      }

      // Fallback to basic browser notifications if Firebase is not available
      if (!firebaseAvailable) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Basic browser notifications enabled');
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async registerDeviceToken(token: string) {
    try {
      await api.registerDeviceToken({
        token,
        type: 'web', // or detect device type
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }

  private handleForegroundMessage(payload: any) {
    // Handle foreground notifications
    if (payload.notification) {
      const { title, body, icon } = payload.notification;
      
      // Create browser notification
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
      });

      // Handle custom data
      if (payload.data) {
        this.handleNotificationData(payload.data);
      }
    }
  }

  private handleNotificationData(data: any) {
    // Handle different types of notifications
    switch (data.type) {
      case 'order_update':
        // Handle order status updates
        console.log('Order update:', data);
        break;
      case 'payment_confirmation':
        // Handle payment confirmations
        console.log('Payment confirmation:', data);
        break;
      case 'promotion':
        // Handle promotional notifications
        console.log('Promotion:', data);
        break;
      default:
        console.log('Unknown notification type:', data);
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined') return 'denied';
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined') return 'denied';
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && !this.isInitialized) {
        await this.initialize();
      }
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Initialize on app load
if (typeof window !== 'undefined') {
  // Check if user is authenticated before initializing
  const token = localStorage.getItem('boiboi_token');
  if (token && notificationService.isSupported()) {
    notificationService.initialize();
  }
}

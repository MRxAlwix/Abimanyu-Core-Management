// Firebase Configuration and Services
// Note: This is a mock implementation for demonstration
// In production, you would need to install firebase SDK and configure properly

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

class FirebaseService {
  private isConnected: boolean = false;
  private config: FirebaseConfig | null = null;

  // Mock Firebase initialization
  initialize(config: FirebaseConfig): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.config = config;
        this.isConnected = true;
        console.log('🔥 Firebase connected successfully (Mock)');
        resolve(true);
      }, 1000);
    });
  }

  // Check connection status
  isFirebaseConnected(): boolean {
    return this.isConnected;
  }

  // Mock data sync
  async syncData(data: any): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Firebase not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📤 Data synced to Firebase (Mock):', Object.keys(data));
        resolve(true);
      }, 500);
    });
  }

  // Mock backup to Firebase
  async backupToFirebase(data: any): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Firebase not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const backupId = `backup_${Date.now()}`;
        console.log('💾 Backup created in Firebase (Mock):', backupId);
        resolve(backupId);
      }, 1000);
    });
  }

  // Mock restore from Firebase
  async restoreFromFirebase(backupId: string): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Firebase not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          workers: [],
          transactions: [],
          projects: [],
          timestamp: new Date().toISOString()
        };
        console.log('📥 Data restored from Firebase (Mock):', backupId);
        resolve(mockData);
      }, 1000);
    });
  }

  // Mock real-time listener
  onDataChange(callback: (data: any) => void): () => void {
    if (!this.isConnected) {
      throw new Error('Firebase not connected');
    }

    const interval = setInterval(() => {
      // Simulate real-time updates
      callback({
        type: 'update',
        timestamp: new Date().toISOString(),
        data: { message: 'Real-time update from Firebase (Mock)' }
      });
    }, 30000); // Every 30 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  // Get connection info
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      projectId: this.config?.projectId || null,
      lastSync: new Date().toISOString(),
      status: this.isConnected ? 'Connected' : 'Disconnected'
    };
  }
}

export const firebaseService = new FirebaseService();

// Auto-initialize with demo config
firebaseService.initialize({
  apiKey: "demo-api-key",
  authDomain: "abimanyu-demo.firebaseapp.com",
  projectId: "abimanyu-demo",
  storageBucket: "abimanyu-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
});
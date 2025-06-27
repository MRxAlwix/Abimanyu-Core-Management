import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export interface QRAttendanceData {
  id: string;
  projectId: string;
  date: string;
  location: string;
  validUntil: string;
}

class QRService {
  async generateAttendanceQR(projectId: string, location: string): Promise<string> {
    const qrData: QRAttendanceData = {
      id: uuidv4(),
      projectId,
      date: new Date().toISOString().split('T')[0],
      location,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid for 24 hours
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  validateQRData(qrDataString: string): QRAttendanceData | null {
    try {
      const qrData: QRAttendanceData = JSON.parse(qrDataString);
      
      // Check if QR code is still valid
      if (new Date(qrData.validUntil) < new Date()) {
        return null;
      }

      return qrData;
    } catch {
      return null;
    }
  }

  async generateProjectQR(projectId: string, projectName: string): Promise<string> {
    const projectData = {
      type: 'project',
      id: projectId,
      name: projectName,
      timestamp: new Date().toISOString(),
    };

    try {
      return await QRCode.toDataURL(JSON.stringify(projectData), {
        width: 200,
        margin: 1,
      });
    } catch (error) {
      console.error('Project QR generation error:', error);
      throw new Error('Failed to generate project QR code');
    }
  }
}

export const qrService = new QRService();
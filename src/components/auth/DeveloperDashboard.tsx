import React, { useState } from 'react';
import { Shield, Users, CheckCircle, XCircle, Eye, Calendar, Building, Mail, Phone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { registrationService, RegistrationRequest } from '../../services/registrationService';
import { formatDate } from '../../utils/calculations';

export function DeveloperDashboard() {
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>(
    registrationService.getRegistrations()
  );
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleApprove = (registrationId: string) => {
    try {
      registrationService.approveRegistration(registrationId);
      setRegistrations(registrationService.getRegistrations());
    } catch (error: any) {
      console.error('Approval error:', error);
    }
  };

  const handleReject = (registrationId: string) => {
    if (!rejectReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }
    
    try {
      registrationService.rejectRegistration(registrationId, rejectReason);
      setRegistrations(registrationService.getRegistrations());
      setIsRejectModalOpen(false);
      setRejectReason('');
      setSelectedRegistration(null);
    } catch (error: any) {
      console.error('Rejection error:', error);
    }
  };

  const getStatusBadge = (status: RegistrationRequest['status']) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
      approved: { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Disetujui' },
      rejected: { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Ditolak' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Developer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Kelola pendaftaran pengguna Abimanyu Core Management
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Pendaftaran
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {registrations.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Menunggu Review
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {pendingCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Disetujui
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {approvedCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ditolak
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {rejectedCount}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card title="Daftar Pendaftaran">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Perusahaan
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Pemilik
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Jenis Usaha
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Tanggal Daftar
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {registration.companyName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {registration.projectCount} proyek, {registration.workerCount} tukang
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {registration.ownerName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <Mail className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm">{registration.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {registration.businessType}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatDate(registration.requestedAt)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(registration.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Eye}
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          Detail
                        </Button>
                        {registration.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              icon={CheckCircle}
                              onClick={() => handleApprove(registration.id)}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              icon={XCircle}
                              onClick={() => {
                                setSelectedRegistration(registration);
                                setIsRejectModalOpen(true);
                              }}
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {registrations.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada pendaftaran
              </p>
            </div>
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRegistration(null);
          }}
          title="Detail Pendaftaran"
          size="lg"
        >
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Perusahaan
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRegistration.companyName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Pemilik
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRegistration.ownerName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRegistration.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telepon
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRegistration.phone}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jenis Usaha
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedRegistration.businessType}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Proyek
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRegistration.projectCount} proyek
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Tukang
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRegistration.workerCount} tukang
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedRegistration.status)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(selectedRegistration.requestedAt)}
                  </span>
                </div>
              </div>

              {selectedRegistration.status === 'rejected' && selectedRegistration.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alasan Penolakan
                  </label>
                  <p className="text-red-600 dark:text-red-400">
                    {selectedRegistration.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setRejectReason('');
            setSelectedRegistration(null);
          }}
          title="Tolak Pendaftaran"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Berikan alasan penolakan untuk pendaftaran ini:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Masukkan alasan penolakan..."
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                  setSelectedRegistration(null);
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={() => selectedRegistration && handleReject(selectedRegistration.id)}
                className="flex-1"
                disabled={!rejectReason.trim()}
              >
                Tolak Pendaftaran
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
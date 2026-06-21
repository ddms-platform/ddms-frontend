import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as signalR from '@microsoft/signalr';
import {
  billingService,
  type FinancialSummary,
} from '@/services/billingService';

interface PaymentReceivedData {
  paymentId: string;
  status: string;
  amount: number;
}

interface UseFinancialSummaryOptions {
  onPaymentReceived?: (data: PaymentReceivedData) => void;
}

export function useFinancialSummary({
  onPaymentReceived,
}: UseFinancialSummaryOptions = {}) {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const onPaymentReceivedRef = useRef(onPaymentReceived);
  useEffect(() => {
    onPaymentReceivedRef.current = onPaymentReceived;
  }, [onPaymentReceived]);

  const fetchSummary = async () => {
    try {
      const data = await billingService.getFinancialSummary();
      setSummary(data);
    } catch (error: any) {
      console.error('Failed to fetch financial summary:', error);
      toast.error(
        error.message || 'Không thể lấy dữ liệu doanh thu & thanh toán',
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    };
    init();

    const token = localStorage.getItem('access_token');
    const hubUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/hub/billing`
      : 'https://localhost:7161/hub/billing';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log('SignalR Hub connected successfully to /hub/billing');
      })
      .catch((err) => {
        console.error('SignalR Connection Error: ', err);
      });

    connection.on('PaymentReceived', (data: PaymentReceivedData) => {
      console.log('Live PaymentReceived update: ', data);
      onPaymentReceivedRef.current?.(data);
      fetchSummary();
    });

    return () => {
      connection.stop().catch(console.error);
    };
  }, []);

  return { summary, loading, refresh: fetchSummary };
}

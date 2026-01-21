import { useState, useEffect } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';

interface NetworkStats {
  networkSpeed: number | null; // Average seconds between ledgers
  baseFee: string | null; // Base fee in stroops
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useStellarNetworkStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState<NetworkStats>({
    networkSpeed: null,
    baseFee: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchNetworkStats = async () => {
    try {
      // Connect to Stellar's public Horizon server
      const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');

      // Fetch the last 10 ledgers
      const ledgersResponse = await server
        .ledgers()
        .order('desc')
        .limit(10)
        .call();

      const ledgers = ledgersResponse.records;

      if (ledgers.length < 2) {
        throw new Error('Not enough ledger data');
      }

      // Calculate average time difference between ledgers
      let totalTimeDiff = 0;
      for (let i = 0; i < ledgers.length - 1; i++) {
        const currentTime = new Date(ledgers[i].closed_at).getTime();
        const previousTime = new Date(ledgers[i + 1].closed_at).getTime();
        const timeDiff = (currentTime - previousTime) / 1000; // Convert to seconds
        totalTimeDiff += timeDiff;
      }

      const averageNetworkSpeed = totalTimeDiff / (ledgers.length - 1);

      // Get base fee from the latest ledger
      const latestLedger = ledgers[0];
      const baseFeeInStroops = latestLedger.base_fee_in_stroops;

      setStats({
        networkSpeed: Number(averageNetworkSpeed.toFixed(2)),
        baseFee: baseFeeInStroops.toString(),
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching Stellar network stats:', error);
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch network stats',
      }));
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNetworkStats();

    // Set up interval for live updates
    const interval = setInterval(fetchNetworkStats, refreshInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return stats;
}

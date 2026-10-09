/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, StockPosition, Operation, ClosedPosition, DividendRecord, UpcomingDividend, Broker, WatchlistItem } from './types/portfolio';
import {
  INITIAL_POSITIONS,
  INITIAL_OPERATIONS,
  INITIAL_CLOSED_POSITIONS,
  INITIAL_DIVIDENDS,
  INITIAL_UPCOMING_DIVIDENDS,
  INITIAL_BROKERS,
  INITIAL_WATCHLIST,
  INITIAL_CASH_EUR,
} from './data/initialData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CurrentPortfolio } from './components/CurrentPortfolio';
import { OperationsView } from './components/OperationsView';
import { ClosedPortfolioView } from './components/ClosedPortfolioView';
import { DividendsView } from './components/DividendsView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaxReportView } from './components/TaxReportView';
import { ReportsView } from './components/ReportsView';
import { DividendCalendarView } from './components/DividendCalendarView';
import { BrokersConfigView } from './components/BrokersConfigView';
import { WatchlistView } from './components/WatchlistView';

import { StockDetailModal } from './components/modals/StockDetailModal';
import { NewOperationModal } from './components/modals/NewOperationModal';
import { NewDividendModal } from './components/modals/NewDividendModal';
import { GitHubMobileGuideModal } from './components/modals/GitHubMobileGuideModal';
import { PrintReportModal } from './components/modals/PrintReportModal';
import { VersionsModal } from './components/modals/VersionsModal';
import { UpdateNotificationBanner } from './components/UpdateNotificationBanner';
import { useAppUpdater } from './hooks/useAppUpdater';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States with localStorage persistence
  const [positions, setPositions] = useState<StockPosition[]>(() => {
    const saved = localStorage.getItem('cartera_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
  });

  const [operations, setOperations] = useState<Operation[]>(() => {
    const saved = localStorage.getItem('cartera_operations');
    return saved ? JSON.parse(saved) : INITIAL_OPERATIONS;
  });

  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>(() => {
    const saved = localStorage.getItem('cartera_closed_positions');
    return saved ? JSON.parse(saved) : INITIAL_CLOSED_POSITIONS;
  });

  const [dividends, setDividends] = useState<DividendRecord[]>(() => {
    const saved = localStorage.getItem('cartera_dividends');
    return saved ? JSON.parse(saved) : INITIAL_DIVIDENDS;
  });

  const [upcomingDividends, setUpcomingDividends] = useState<UpcomingDividend[]>(() => {
    const saved = localStorage.getItem('cartera_upcoming_dividends');
    return saved ? JSON.parse(saved) : INITIAL_UPCOMING_DIVIDENDS;
  });

  const [brokers, setBrokers] = useState<Broker[]>(() => {
    const saved = localStorage.getItem('cartera_brokers');
    return saved ? JSON.parse(saved) : INITIAL_BROKERS;
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('cartera_watchlist');
    return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
  });

  const [cashEUR, setCashEUR] = useState<number>(() => {
    const saved = localStorage.getItem('cartera_cash');
    return saved ? JSON.parse(saved) : INITIAL_CASH_EUR;
  });

  // Modals
  const [selectedStock, setSelectedStock] = useState<StockPosition | null>(null);
  const [isNewOpOpen, setIsNewOpOpen] = useState(false);
  const [prefilledSymbol, setPrefilledSymbol] = useState<string | undefined>(undefined);
  const [isNewDivOpen, setIsNewDivOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'full' | 'annual' | 'tax'>('full');
  const [printOptions, setPrintOptions] = useState<{ charts: boolean; dividends: boolean; closed: boolean }>({
    charts: true,
    dividends: true,
    closed: true,
  });

  // Versions Modal & Automatic App Updater (GitHub sync)
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const {
    currentVersion,
    currentVersionSha,
    isChecking: isCheckingUpdates,
    isUpdating,
    updateAvailable,
    justUpdated,
    manualFeedback,
    history: versionsHistory,
    autoUpdate,
    lastChecked,
    checkForUpdates,
    handleInstallNow,
    handleToggleAutoUpdate,
    dismissJustUpdated,
    dismissManualFeedback,
  } = useAppUpdater();

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cartera_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('cartera_operations', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem('cartera_closed_positions', JSON.stringify(closedPositions));
  }, [closedPositions]);

  useEffect(() => {
    localStorage.setItem('cartera_dividends', JSON.stringify(dividends));
  }, [dividends]);

  useEffect(() => {
    localStorage.setItem('cartera_upcoming_dividends', JSON.stringify(upcomingDividends));
  }, [upcomingDividends]);

  useEffect(() => {
    localStorage.setItem('cartera_brokers', JSON.stringify(brokers));
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem('cartera_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('cartera_cash', JSON.stringify(cashEUR));
  }, [cashEUR]);

  // Handlers
  const handleToggleFavorite = (stockId: string) => {
    setPositions(prev =>
      prev.map(p => (p.id === stockId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (selectedStock && selectedStock.id === stockId) {
      setSelectedStock(prev => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleOpenNewOperation = (symbol?: string) => {
    setPrefilledSymbol(symbol);
    setIsNewOpOpen(true);
  };

  const handleAddOperation = (opData: {
    type: 'Compra' | 'Venta';
    symbol: string;
    company: string;
    shares: number;
    price: number;
    totalEUR: number;
    commissionEUR: number;
    date: string;
    broker: string;
  }) => {
    const newOp: Operation = {
      id: `op-${Date.now()}`,
      ...opData,
    };
    setOperations(prev => [newOp, ...prev]);

    // Update positions and closed positions accordingly
    const existingIdx = positions.findIndex(p => p.symbol.toUpperCase() === opData.symbol.toUpperCase());

    if (opData.type === 'Compra') {
      if (existingIdx >= 0) {
        const cur = positions[existingIdx];
        const newShares = cur.shares + opData.shares;
        const totalCost = cur.shares * cur.buyPrice + opData.totalEUR;
        const newBuyPrice = totalCost / newShares;
        const newValueEUR = newShares * cur.currentPrice;
        const newGainEUR = newValueEUR - totalCost;
        const newGainPercent = (newGainEUR / totalCost) * 100;

        const updated = [...positions];
        updated[existingIdx] = {
          ...cur,
          shares: newShares,
          buyPrice: Number(newBuyPrice.toFixed(2)),
          currentValueEUR: Number(newValueEUR.toFixed(2)),
          gainLossEUR: Number(newGainEUR.toFixed(2)),
          gainLossPercent: Number(newGainPercent.toFixed(2)),
        };
        setPositions(updated);
      } else {
        // Add new position
        const newPos: StockPosition = {
          id: opData.symbol.toLowerCase(),
          symbol: opData.symbol,
          company: opData.company,
          country: 'USA',
          currency: 'USD',
          shares: opData.shares,
          buyPrice: opData.price,
          currentPrice: opData.price,
          currentValueEUR: opData.totalEUR,
          gainLossEUR: 0,
          gainLossPercent: 0,
          sector: 'Otros',
          color: '#3b82f6',
        };
        setPositions(prev => [...prev, newPos]);
      }
    } else {
      // Venta
      if (existingIdx >= 0) {
        const cur = positions[existingIdx];
        const gainEUR = (opData.price - cur.buyPrice) * opData.shares - opData.commissionEUR;
        const gainPercent = cur.buyPrice > 0 ? (gainEUR / (cur.buyPrice * opData.shares)) * 100 : 0;

        // Record into closed positions
        const parts = opData.date.split('/');
        const year = parts.length === 3 ? parseInt(parts[2], 10) : new Date().getFullYear();

        const closedRecord: ClosedPosition = {
          id: `cl-${Date.now()}`,
          symbol: opData.symbol,
          company: opData.company,
          saleDate: opData.date,
          year: isNaN(year) ? 2024 : year,
          shares: opData.shares,
          salePrice: opData.price,
          buyPrice: cur.buyPrice,
          resultEUR: Number(gainEUR.toFixed(2)),
          resultPercent: Number(gainPercent.toFixed(2)),
        };
        setClosedPositions(prev => [closedRecord, ...prev]);

        // Reduce remaining shares
        const remainingShares = cur.shares - opData.shares;
        if (remainingShares <= 0) {
          setPositions(prev => prev.filter((_, idx) => idx !== existingIdx));
        } else {
          const updated = [...positions];
          const newValueEUR = remainingShares * cur.currentPrice;
          const costBasis = remainingShares * cur.buyPrice;
          const newGainEUR = newValueEUR - costBasis;
          const newGainPercent = (newGainEUR / costBasis) * 100;

          updated[existingIdx] = {
            ...cur,
            shares: remainingShares,
            currentValueEUR: Number(newValueEUR.toFixed(2)),
            gainLossEUR: Number(newGainEUR.toFixed(2)),
            gainLossPercent: Number(newGainPercent.toFixed(2)),
          };
          setPositions(updated);
        }
      }
    }
  };

  const handleDeleteOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
  };

  const handleAddDividend = (dividendData: {
    symbol: string;
    company: string;
    grossEUR: number;
    withholdingEUR: number;
    netEUR: number;
    date: string;
    year: number;
  }) => {
    const newDiv: DividendRecord = {
      id: `div-${Date.now()}`,
      ...dividendData,
    };
    setDividends(prev => [newDiv, ...prev]);
  };

  const handleAddBroker = (brokerData: Omit<Broker, 'id'>) => {
    const newBrk: Broker = {
      id: `brk-${Date.now()}`,
      ...brokerData,
    };
    setBrokers(prev => [...prev, newBrk]);
  };

  const handleToggleBroker = (id: string) => {
    setBrokers(prev =>
      prev.map(b => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Deseas restaurar todos los datos iniciales de la Cartera de Valores?')) {
      setPositions(INITIAL_POSITIONS);
      setOperations(INITIAL_OPERATIONS);
      setClosedPositions(INITIAL_CLOSED_POSITIONS);
      setDividends(INITIAL_DIVIDENDS);
      setUpcomingDividends(INITIAL_UPCOMING_DIVIDENDS);
      setBrokers(INITIAL_BROKERS);
      setWatchlist(INITIAL_WATCHLIST);
      setCashEUR(INITIAL_CASH_EUR);
      localStorage.clear();
    }
  };

  const handleOpenPrintReport = (
    type: 'full' | 'annual' | 'tax',
    options?: { charts: boolean; dividends: boolean; closed: boolean }
  ) => {
    setPrintType(type);
    if (options) {
      setPrintOptions(options);
    }
    setIsPrintModalOpen(true);
  };

  const handleAddWatchlist = (item: Omit<WatchlistItem, 'id'>) => {
    const newItem: WatchlistItem = {
      id: `w-${Date.now()}`,
      ...item,
    };
    setWatchlist(prev => [newItem, ...prev]);
  };

  const handleRemoveWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  };

  const totalPortfolioValue = positions.reduce((acc, p) => acc + p.currentValueEUR, 0);

  return (
    <div className="min-h-screen bg-[#0a1424] text-slate-100 flex flex-col font-sans">
      {/* Update Notification Banner / Toast */}
      <UpdateNotificationBanner
        updateAvailable={updateAvailable}
        justUpdated={justUpdated}
        manualFeedback={manualFeedback}
        isUpdating={isUpdating}
        onInstallNow={handleInstallNow}
        onDismissJustUpdated={dismissJustUpdated}
        onDismissManualFeedback={dismissManualFeedback}
        onOpenVersionsModal={() => setIsVersionsModalOpen(true)}
      />

      {/* Header */}
      <Header
        currentTab={currentTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        totalPortfolioValue={totalPortfolioValue}
        currentVersion={currentVersion}
        onOpenVersionsModal={() => setIsVersionsModalOpen(true)}
        isCheckingVersion={isCheckingUpdates}
        hasPendingUpdate={Boolean(updateAvailable)}
        onCheckForUpdates={() => checkForUpdates(true)}
        onInstallNow={() => handleInstallNow()}
      />

      {/* Main layout container with sidebar and content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenGuide={() => setIsGuideOpen(true)}
          currentVersion={currentVersion}
          onOpenVersionsModal={() => setIsVersionsModalOpen(true)}
          onCheckForUpdates={() => checkForUpdates(true)}
          isCheckingVersion={isCheckingUpdates}
          hasPendingUpdate={Boolean(updateAvailable)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#0a1424] via-[#0d1a30] to-[#0a1424]">
          <div className="max-w-7xl mx-auto">
            {/* View Switching */}
            {currentTab === 'dashboard' && (
              <Dashboard
                positions={positions}
                onNavigate={setCurrentTab}
                onOpenNewOperation={() => handleOpenNewOperation()}
                onSelectStock={stock => setSelectedStock(stock)}
                closedPositionsCount={closedPositions.length}
                cashEUR={cashEUR}
              />
            )}

            {currentTab === 'current' && (
              <CurrentPortfolio
                positions={positions}
                onSelectStock={stock => setSelectedStock(stock)}
                onOpenNewOperation={handleOpenNewOperation}
              />
            )}

            {currentTab === 'operations' && (
              <OperationsView
                operations={operations}
                onOpenNewOperation={() => handleOpenNewOperation()}
                onDeleteOperation={handleDeleteOperation}
              />
            )}

            {currentTab === 'closed' && (
              <ClosedPortfolioView closedPositions={closedPositions} />
            )}

            {currentTab === 'dividends' && (
              <DividendsView
                dividends={dividends}
                onOpenNewDividend={() => setIsNewDivOpen(true)}
              />
            )}

            {currentTab === 'analytics' && <AnalyticsView />}

            {currentTab === 'tax' && (
              <TaxReportView onOpenPrintReport={handleOpenPrintReport} />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                positions={positions}
                operations={operations}
                closedPositions={closedPositions}
                dividends={dividends}
                onOpenPrintReport={handleOpenPrintReport}
              />
            )}

            {currentTab === 'calendar' && (
              <DividendCalendarView upcomingDividends={upcomingDividends} />
            )}

            {currentTab === 'watchlist' && (
              <WatchlistView
                watchlist={watchlist}
                onAddWatchlist={handleAddWatchlist}
                onRemoveWatchlist={handleRemoveWatchlist}
                onOpenBuyOperation={symbol => handleOpenNewOperation(symbol)}
              />
            )}

            {currentTab === 'config' && (
              <BrokersConfigView
                brokers={brokers}
                onAddBroker={handleAddBroker}
                onToggleBroker={handleToggleBroker}
                onResetToDefaults={handleResetToDefaults}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODAL 1: Stock Detail (Screen 3) */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onToggleFavorite={handleToggleFavorite}
        operations={operations}
        dividends={dividends}
        onOpenNewOperation={handleOpenNewOperation}
      />

      {/* MODAL 2: New Operation (Screen 4 "+ Nueva operación") */}
      <NewOperationModal
        isOpen={isNewOpOpen}
        onClose={() => {
          setIsNewOpOpen(false);
          setPrefilledSymbol(undefined);
        }}
        onSubmit={handleAddOperation}
        availablePositions={positions}
        brokers={brokers}
        prefilledSymbol={prefilledSymbol}
      />

      {/* MODAL 3: New Dividend */}
      <NewDividendModal
        isOpen={isNewDivOpen}
        onClose={() => setIsNewDivOpen(false)}
        onSubmit={handleAddDividend}
        availablePositions={positions}
      />

      {/* MODAL 4: Step-by-Step GitHub & Mobile (Web + Android APK + PWA) Guide */}
      <GitHubMobileGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* MODAL 5: Printable Vector PDF & Document Report */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportType={printType}
        positions={positions}
        operations={operations}
        closedPositions={closedPositions}
        dividends={dividends}
        options={printOptions}
      />

      {/* MODAL 6: Modified Versions History & GitHub Sync */}
      <VersionsModal
        isOpen={isVersionsModalOpen}
        onClose={() => setIsVersionsModalOpen(false)}
        currentVersion={currentVersion}
        currentCommitSha={currentVersionSha}
        history={versionsHistory}
        isChecking={isCheckingUpdates}
        isUpdating={isUpdating}
        lastChecked={lastChecked}
        autoUpdate={autoUpdate}
        updateAvailable={updateAvailable}
        onCheckForUpdates={() => checkForUpdates(true)}
        onInstallUpdate={handleInstallNow}
        onToggleAutoUpdate={handleToggleAutoUpdate}
      />
    </div>
  );
}

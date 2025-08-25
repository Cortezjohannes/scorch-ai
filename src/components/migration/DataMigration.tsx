'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/context/FirebaseContext';
import {
  AlertCircle,
  Check,
  ArrowRight,
  CloudUpload,
  Loader2
} from 'lucide-react';

const DataMigration: React.FC = () => {
  const { user, migrationStatus, migrateData } = useFirebase();
  const [showMigration, setShowMigration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show migration dialog if user is logged in and migration is pending
    if (user && migrationStatus === 'pending') {
      // Wait a moment before showing to avoid flashing
      const timer = setTimeout(() => {
        setShowMigration(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setShowMigration(false);
    }
  }, [user, migrationStatus]);

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      await migrateData();
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setShowMigration(false);
  };

  if (!showMigration) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full border border-slate-700">
        <div className="flex items-center mb-4">
          <CloudUpload className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Migrate Your Data</h2>
        </div>
        
        <p className="text-slate-300 mb-4">
          We've detected locally stored data on your device. Would you like to migrate it to your cloud account for access across all your devices?
        </p>
        
        {migrationStatus === 'error' && (
          <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-300 text-sm">
              There was a problem migrating your data. Please try again or skip for now.
            </p>
          </div>
        )}
        
        {migrationStatus === 'completed' && (
          <div className="bg-green-900/30 border border-green-700 rounded px-4 py-3 mb-4 flex items-start">
            <Check className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-green-300 text-sm">
              Data migration completed successfully! Your data is now available across all your devices.
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          {migrationStatus !== 'completed' && (
            <>
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                disabled={isLoading}
              >
                Skip for now
              </button>
              
              <button
                onClick={handleMigration}
                disabled={isLoading || migrationStatus === 'in-progress'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                {isLoading || migrationStatus === 'in-progress' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    Migrate Data
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </>
          )}
          
          {migrationStatus === 'completed' && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataMigration; 
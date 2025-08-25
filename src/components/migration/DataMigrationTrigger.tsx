'use client';

import React, { useState } from 'react';
import { useFirebase } from '@/context/FirebaseContext';
import { CloudUpload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface DataMigrationTriggerProps {
  className?: string;
}

const DataMigrationTrigger: React.FC<DataMigrationTriggerProps> = ({ className = '' }) => {
  const { user, migrationStatus, migrateData } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleMigrate = async () => {
    setIsLoading(true);
    try {
      await migrateData();
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  let statusElement;
  switch (migrationStatus) {
    case 'completed':
      statusElement = (
        <div className="flex items-center text-green-400">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Data migration completed</span>
        </div>
      );
      break;
    case 'error':
      statusElement = (
        <div className="flex items-center text-red-400">
          <XCircle className="h-5 w-5 mr-2" />
          <span>Migration failed</span>
        </div>
      );
      break;
    case 'in-progress':
      statusElement = (
        <div className="flex items-center text-blue-400">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          <span>Migration in progress...</span>
        </div>
      );
      break;
    default:
      statusElement = (
        <div className="flex items-center">
          <CloudUpload className="h-5 w-5 mr-2 text-blue-400" />
          <span className="text-slate-300">Migrate local data to Firebase</span>
        </div>
      );
  }

  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <CloudUpload className="h-6 w-6 mr-2 text-blue-400" />
        Data Migration
      </h3>
      
      <p className="text-slate-300 mb-4">
        Move your locally stored data (projects, preferences, and videos) to your cloud account
        for access across devices.
      </p>
      
      <div className="mb-4">
        {statusElement}
      </div>
      
      {migrationStatus !== 'completed' && migrationStatus !== 'in-progress' && (
        <button
          onClick={handleMigrate}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              Migrate Data
              <CloudUpload className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default DataMigrationTrigger; 
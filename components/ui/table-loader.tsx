"use client";

import React, { useState, useEffect } from 'react';
import { getTableRecord } from '@/lib/utils/table-loader';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface TableData {
  id: string;
  headers?: string[];
  rows: Record<string, string>[];
}

interface TableLoaderProps {
  tableId: string;
  className?: string;
}

export function TableLoader({
  tableId,
  className = ''
}: TableLoaderProps) {
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);
    
    async function loadTable() {
      if (!tableId) {
        setIsLoading(false);
        setHasError(true);
        return;
      }
      
      try {
        const data = await getTableRecord(tableId);
        
        if (isMounted) {
          if (data) {
            setTableData(data);
            setHasError(false);
          } else {
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading table:", error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }
    
    loadTable();
    
    return () => {
      isMounted = false;
    };
  }, [tableId]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Skeleton className="w-full h-24" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (hasError || !tableData) {
    return (
      <div className={`p-4 border border-red-200 bg-red-50 rounded ${className}`}>
        <p className="text-red-500 text-sm">Unable to load table data</p>
      </div>
    );
  }

  // Convert row objects to arrays for rendering
  const rowArrays = tableData.rows.map(row => {
    const values = [];
    // Object keys are string indices like "0", "1", "2"...
    for (let i = 0; i < Object.keys(row).length; i++) {
      values.push(row[i.toString()] || '');
    }
    return values;
  });

  // Function to render cell content with basic markdown for bold text
  const renderCell = (content: string) => {
    if (content.startsWith('**') && content.endsWith('**')) {
      return <strong>{content.slice(2, -2)}</strong>;
    }
    return content;
  };

  // Render the table
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {tableData.headers && tableData.headers.length > 0 && (
          <thead className="bg-gray-50">
            <tr>
              {tableData.headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white divide-y divide-gray-200">
          {rowArrays.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
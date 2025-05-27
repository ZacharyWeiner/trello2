'use client';

import React from 'react';
import { AlertTriangle, Clock, Link2 } from 'lucide-react';
import { Card, CardDependency } from '@/types';

interface CardDependencyIndicatorProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const CardDependencyIndicator: React.FC<CardDependencyIndicatorProps> = ({
  card,
  size = 'sm',
  showTooltip = true,
}) => {
  const dependencies = card.dependencies || [];
  const blockedBy = card.blockedBy || [];
  
  const hasBlocking = dependencies.some(dep => dep.type === 'blocks');
  const hasBlocked = blockedBy.some(dep => dep.type === 'blocked_by');
  const hasRelated = [...dependencies, ...blockedBy].some(dep => dep.type === 'related');
  
  const totalDependencies = dependencies.length + blockedBy.length;
  
  if (totalDependencies === 0) return null;

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 20;
  const containerClass = `flex items-center gap-1 ${
    size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
  }`;

  const getTooltipText = () => {
    const parts = [];
    if (hasBlocking) {
      const count = dependencies.filter(d => d.type === 'blocks').length;
      parts.push(`🔴 Blocking ${count} card${count > 1 ? 's' : ''} (prevents them from starting)`);
    }
    if (hasBlocked) {
      const count = blockedBy.filter(d => d.type === 'blocked_by').length;
      parts.push(`🟡 Blocked by ${count} card${count > 1 ? 's' : ''} (can't start until they're done)`);
    }
    if (hasRelated) {
      const count = [...dependencies, ...blockedBy].filter(d => d.type === 'related').length;
      parts.push(`🔵 Related to ${count} card${count > 1 ? 's' : ''} (general connection)`);
    }
    return parts.join('\n');
  };

  return (
    <div 
      className={`${containerClass} relative group`}
      title={showTooltip ? getTooltipText() : undefined}
    >
      {/* Blocking indicator */}
      {hasBlocking && (
        <div className="flex items-center text-red-500">
          <AlertTriangle size={iconSize} />
          <span className="ml-1">{dependencies.filter(d => d.type === 'blocks').length}</span>
        </div>
      )}
      
      {/* Blocked by indicator */}
      {hasBlocked && (
        <div className="flex items-center text-yellow-500">
          <Clock size={iconSize} />
          <span className="ml-1">{blockedBy.filter(d => d.type === 'blocked_by').length}</span>
        </div>
      )}
      
      {/* Related indicator */}
      {hasRelated && (
        <div className="flex items-center text-blue-500">
          <Link2 size={iconSize} />
          <span className="ml-1">{[...dependencies, ...blockedBy].filter(d => d.type === 'related').length}</span>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-pre-line z-10 max-w-xs">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Simplified version for mobile
export const CardDependencyBadge: React.FC<{ card: Card }> = ({ card }) => {
  const totalDependencies = (card.dependencies?.length || 0) + (card.blockedBy?.length || 0);
  
  if (totalDependencies === 0) return null;

  const hasBlocking = card.dependencies?.some(dep => dep.type === 'blocks');
  const hasBlocked = card.blockedBy?.some(dep => dep.type === 'blocked_by');
  
  const badgeColor = hasBlocked 
    ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
    : hasBlocking 
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${badgeColor} pointer-events-none`}
      style={{ touchAction: 'none' }}
    >
      <Link2 size={10} />
      <span>{totalDependencies}</span>
    </div>
  );
}; 
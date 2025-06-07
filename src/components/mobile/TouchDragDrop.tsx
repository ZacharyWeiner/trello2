'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface TouchDragDropProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (info: PanInfo) => void;
  onDrop?: (dropZone: string) => void;
  dragData?: any;
  className?: string;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

interface DropZone {
  id: string;
  element: HTMLElement;
  bounds: DOMRect;
}

export const TouchDragDrop: React.FC<TouchDragDropProps> = ({
  children,
  onDragStart,
  onDragEnd,
  onDrop,
  dragData,
  className = '',
  disabled = false,
  hapticFeedback = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform([x, y], ([latestX, latestY]) => {
    const distance = Math.sqrt((latestX as number) * (latestX as number) + (latestY as number) * (latestY as number));
    return isDragging ? Math.min(1.1, 1 + distance / 1000) : 1;
  });

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback) return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Find drop zones on mount and when dragging starts
  useEffect(() => {
    const findDropZones = () => {
      const zones = Array.from(document.querySelectorAll('[data-drop-zone]')).map(
        (element) => ({
          id: element.getAttribute('data-drop-zone') || '',
          element: element as HTMLElement,
          bounds: element.getBoundingClientRect(),
        })
      );
      setDropZones(zones);
    };

    if (isDragging) {
      findDropZones();
      // Update drop zones on scroll/resize during drag
      const updateDropZones = () => {
        setDropZones(zones => 
          zones.map(zone => ({
            ...zone,
            bounds: zone.element.getBoundingClientRect(),
          }))
        );
      };
      
      window.addEventListener('scroll', updateDropZones, { passive: true });
      window.addEventListener('resize', updateDropZones);
      
      return () => {
        window.removeEventListener('scroll', updateDropZones);
        window.removeEventListener('resize', updateDropZones);
      };
    }
  }, [isDragging]);

  const handleDragStart = () => {
    if (disabled) return;
    
    setIsDragging(true);
    triggerHaptic('light');
    onDragStart?.();
    
    // Add visual feedback to body
    document.body.classList.add('dragging');
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    // Get current pointer position
    const pointerX = info.point.x;
    const pointerY = info.point.y;
    
    // Check which drop zone we're over
    const currentDropZone = dropZones.find(zone => {
      const { left, right, top, bottom } = zone.bounds;
      return pointerX >= left && pointerX <= right && pointerY >= top && pointerY <= bottom;
    });
    
    const newActiveDropZone = currentDropZone?.id || null;
    
    // Trigger haptic feedback when entering a new drop zone
    if (newActiveDropZone !== activeDropZone) {
      if (newActiveDropZone) {
        triggerHaptic('medium');
      }
      setActiveDropZone(newActiveDropZone);
    }
    
    // Update drop zone visual states
    dropZones.forEach(zone => {
      const isActive = zone.id === newActiveDropZone;
      zone.element.classList.toggle('drop-zone-active', isActive);
    });
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    document.body.classList.remove('dragging');
    
    // Clear drop zone states
    dropZones.forEach(zone => {
      zone.element.classList.remove('drop-zone-active');
    });
    
    // Handle drop
    if (activeDropZone && onDrop) {
      triggerHaptic('heavy');
      onDrop(activeDropZone);
    }
    
    setActiveDropZone(null);
    onDragEnd?.(info);
    
    // Reset position
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={dragRef}
      className={`touch-drag-item ${className} ${isDragging ? 'dragging' : ''}`}
      style={{
        x,
        y,
        scale,
        zIndex: isDragging ? 1000 : 'auto',
        cursor: disabled ? 'default' : 'grab',
      }}
      drag={!disabled}
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.05,
        rotate: 2,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
};

// Drop zone component
interface DropZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onDrop?: (data: any) => void;
  acceptTypes?: string[];
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  children,
  className = '',
  onDrop,
  acceptTypes = [],
}) => {
  return (
    <div
      data-drop-zone={id}
      className={`drop-zone ${className}`}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer?.getData('text/plain');
        if (data && onDrop) {
          onDrop(JSON.parse(data));
        }
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

// Hook for managing drag and drop state
export const useTouchDragDrop = () => {
  const [dragData, setDragData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const startDrag = (data: any) => {
    setDragData(data);
    setIsDragging(true);
  };
  
  const endDrag = () => {
    setDragData(null);
    setIsDragging(false);
  };
  
  return {
    dragData,
    isDragging,
    startDrag,
    endDrag,
  };
}; 
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { getDependencyGraph } from '@/services/cardDependencyService';

interface DependencyGraphProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface GraphNode {
  id: string;
  title: string;
  listId: string;
  listTitle: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'blocks' | 'blocked_by' | 'related';
  reason?: string;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  boardId,
  isOpen,
  onClose,
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGraph();
    }
  }, [isOpen, boardId]);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const graph = await getDependencyGraph(boardId);
      
      // Simple layout algorithm - arrange nodes in a circle
      const nodeCount = graph.nodes.length;
      const radius = Math.max(150, nodeCount * 20);
      const centerX = 300;
      const centerY = 200;

      const layoutNodes: GraphNode[] = graph.nodes.map((node, index) => {
        const angle = (index / nodeCount) * 2 * Math.PI;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });

      setNodes(layoutNodes);
      setEdges(graph.edges);
    } catch (error) {
      console.error('Error loading dependency graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEdgeColor = (type: string) => {
    switch (type) {
      case 'blocks':
        return '#ef4444'; // red
      case 'related':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  const getNodeColor = (nodeId: string) => {
    const hasBlocking = edges.some(edge => edge.from === nodeId && edge.type === 'blocks');
    const isBlocked = edges.some(edge => edge.to === nodeId && edge.type === 'blocks');
    
    if (hasBlocking && isBlocked) return '#f59e0b'; // amber - both blocking and blocked
    if (hasBlocking) return '#ef4444'; // red - blocking others
    if (isBlocked) return '#eab308'; // yellow - blocked by others
    return '#3b82f6'; // blue - no blocking relationships
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${
        isFullscreen ? 'p-0' : ''
      }`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-3/4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Dependency Graph
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading dependency graph...</p>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">No dependencies found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Add dependencies between cards to see the graph
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full overflow-auto">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 400"
                className="w-full h-full"
              >
                {/* Edges */}
                {edges.map((edge, index) => {
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  
                  if (!fromNode || !toNode) return null;

                  return (
                    <g key={index}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={getEdgeColor(edge.type)}
                        strokeWidth={2}
                        markerEnd="url(#arrowhead)"
                      />
                      {edge.reason && (
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2}
                          textAnchor="middle"
                          className="text-xs fill-gray-600 dark:fill-gray-400"
                        >
                          {edge.reason}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Arrow marker */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#6b7280"
                    />
                  </marker>
                </defs>

                {/* Nodes */}
                {nodes.map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={30}
                      fill={getNodeColor(node.id)}
                      stroke="#fff"
                      strokeWidth={2}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text
                      x={node.x}
                      y={node.y - 5}
                      textAnchor="middle"
                      className="text-xs fill-white font-medium pointer-events-none"
                    >
                      {node.title.length > 10 ? `${node.title.substring(0, 10)}...` : node.title}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 8}
                      textAnchor="middle"
                      className="text-xs fill-white opacity-75 pointer-events-none"
                    >
                      {node.listTitle}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Blocks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Related</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Blocking others</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">No blocking</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 
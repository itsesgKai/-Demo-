
import React, { useState } from 'react';
import { SpaceNode } from '../types';
import { ChevronRight, ChevronDown, Map, Building, Layers, LayoutGrid } from 'lucide-react';

interface Props {
  nodes: SpaceNode[];
  onSelect: (node: SpaceNode) => void;
  selectedId: string | null;
  isOpen: boolean;
}

const NodeItem: React.FC<{ node: SpaceNode; level: number; onSelect: any; selectedId: string | null }> = ({ node, level, onSelect, selectedId }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedId;

  const Icon = () => {
    switch (node.type) {
      case 'campus': return <Map size={14} />;
      case 'building': return <Building size={14} />;
      case 'floor': return <Layers size={14} />;
      default: return <LayoutGrid size={14} />;
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center py-2 px-3 cursor-pointer rounded-lg transition-all text-sm mb-0.5
          ${isSelected 
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}
        `}
        style={{ paddingLeft: `${level * 14 + 12}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
      >
        <div 
          className="mr-2 text-slate-500 hover:text-slate-300 p-0.5"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {hasChildren ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5 inline-block" />}
        </div>
        <Icon />
        <span className="ml-2 truncate">{node.name}</span>
      </div>
      {hasChildren && expanded && (
        <div className="border-l border-slate-800 ml-[18px]">
          {node.children!.map(child => (
            <div key={child.id} className="-ml-[18px]">
               <NodeItem 
                node={child} 
                level={level + 1} 
                onSelect={onSelect} 
                selectedId={selectedId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TopologySidebar: React.FC<Props> = ({ nodes, onSelect, selectedId, isOpen }) => {
  return (
    <div 
      className={`
        bg-[#0f172a] border-r border-slate-800 flex flex-col shadow-xl z-30
        fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out
        xl:relative xl:translate-x-0 pt-4 xl:pt-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {nodes.map(node => (
          <NodeItem key={node.id} node={node} level={0} onSelect={onSelect} selectedId={selectedId} />
        ))}
      </div>
    </div>
  );
};

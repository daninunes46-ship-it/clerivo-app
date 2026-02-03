import React from 'react';
import { Droppable } from '@hello-pangea/dnd';

const KanbanColumn = ({ columnId, title, count, colorClass, children }) => {
  return (
    <div className="flex-shrink-0 w-[80vw] md:w-auto md:flex-1 flex flex-col h-full max-h-full snap-center">
      {/* Header de colonne */}
      <div className={`flex items-center justify-between p-3 rounded-t-xl border-b-2 bg-zinc-50 ${colorClass.border}`}>
        <h3 className={`font-bold text-sm uppercase tracking-wide ${colorClass.text}`}>
          {title}
        </h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white shadow-sm ${colorClass.text}`}>
          {count}
        </span>
      </div>

      {/* Zone de contenu scrollable + Droppable */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 overflow-y-auto p-3 rounded-b-xl border-x border-b border-zinc-100 space-y-3 min-h-[500px] transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-indigo-50/30 ring-inset ring-2 ring-indigo-500/10' : 'bg-zinc-50/50'}
            `}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;

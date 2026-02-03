import React from 'react';
import { Calendar, User, MapPin } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

const DealCard = ({ deal, index, statusColor = 'border-l-zinc-200' }) => {
  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`
            bg-white p-4 rounded-xl shadow-sm border border-zinc-100 
            border-l-4 ${statusColor}
            transition-all duration-200 ease-out
            group cursor-grab active:cursor-grabbing
            ${snapshot.isDragging ? 'shadow-xl rotate-2 scale-105 ring-2 ring-indigo-500/20 z-50' : 'hover:shadow-md'}
          `}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-zinc-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
              {deal.title}
            </h4>
          </div>
          
          <div className="flex items-center gap-1.5 mb-3 text-xs text-zinc-500">
            <MapPin size={12} />
            <span className="truncate">{deal.location}</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
              <User size={12} />
              <span className="truncate max-w-[80px]">{deal.client}</span>
            </div>
            <span className={`text-sm font-bold ${statusColor.includes('emerald') ? 'text-emerald-600' : 'text-zinc-700'}`}>
              {deal.price}
            </span>
          </div>
          
          <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1 justify-end">
            <Calendar size={10} />
            {deal.date}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DealCard;

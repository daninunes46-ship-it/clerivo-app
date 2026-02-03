import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from '../components/kanban/KanbanColumn';
import DealCard from '../components/kanban/DealCard';
import ContactDetailPanel from './ContactDetailPanel';

// Données initiales normalisées
const INITIAL_DATA = {
  deals: {
    'deal-1': { id: 'deal-1', title: 'Recherche Loft Centre', client: 'M. Dubois', location: 'Lausanne Centre', price: '1.2M CHF', date: 'Auj.' },
    'deal-2': { id: 'deal-2', title: 'Investissement Locatif', client: 'Invest Corp', location: 'Renens', price: '850k CHF', date: 'Hier' },
    'deal-3': { id: 'deal-3', title: 'Maison Familiale', client: 'Famille Martin', location: 'Pully', price: '2.4M CHF', date: '2 j' },
    'deal-4': { id: 'deal-4', title: 'Villa Vue Lac', client: 'Mme. Weber', location: 'Lutry', price: '3.8M CHF', date: 'Demain' },
    'deal-5': { id: 'deal-5', title: 'Duplex Terrasse', client: 'M. Favre', location: 'Morges', price: '1.1M CHF', date: 'Ven.' },
    'deal-6': { id: 'deal-6', title: 'Attique Prestige', client: 'M. Rossi', location: 'Montreux', price: '4.5M CHF', date: 'En cours' },
    'deal-7': { id: 'deal-7', title: 'Appartement T4', client: 'Mlle. Blanc', location: 'Vevey', price: '980k CHF', date: '2 Fév' },
    'deal-8': { id: 'deal-8', title: 'Studio Gare', client: 'M. Petit', location: 'Lausanne', price: '450k CHF', date: '30 Jan' },
  },
  columns: {
    'leads': {
      id: 'leads',
      title: 'Nouveaux Leads',
      color: { border: 'border-indigo-500', text: 'text-indigo-600', cardBorder: 'border-l-indigo-500' },
      dealIds: ['deal-1', 'deal-2', 'deal-3'],
    },
    'visits': {
      id: 'visits',
      title: 'Visites en cours',
      color: { border: 'border-blue-500', text: 'text-blue-600', cardBorder: 'border-l-blue-500' },
      dealIds: ['deal-4', 'deal-5'],
    },
    'offers': {
      id: 'offers',
      title: 'Offres / Négo',
      color: { border: 'border-amber-500', text: 'text-amber-600', cardBorder: 'border-l-amber-500' },
      dealIds: ['deal-6'],
    },
    'sold': {
      id: 'sold',
      title: 'Signé / Vendu',
      color: { border: 'border-emerald-500', text: 'text-emerald-600', cardBorder: 'border-l-emerald-500' },
      dealIds: ['deal-7', 'deal-8'],
    },
  },
  columnOrder: ['leads', 'visits', 'offers', 'sold'],
};

const PipelinePage = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [selectedContact, setSelectedContact] = useState(null);

  // Helper pour simuler un contact depuis un deal
  const handleDealClick = (deal) => {
    // Dans une vraie app, on ferait un fetch du contactId.
    // Ici on mock un contact à la volée basé sur le deal.
    const mockContact = {
      id: 99,
      firstName: deal.client.split(' ')[1] || 'Client',
      lastName: deal.client.split(' ')[0] || '',
      email: 'client@exemple.ch',
      phone: '+41 79 123 45 67',
      type: 'ACHETEUR',
      color: 'bg-indigo-100 text-indigo-700',
      status: 'Actif'
    };
    setSelectedContact(mockContact);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Pas de destination ou drop au même endroit
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Déplacement dans la même colonne (Réorganisation)
    if (startColumn === finishColumn) {
      const newDealIds = Array.from(startColumn.dealIds);
      newDealIds.splice(source.index, 1);
      newDealIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        dealIds: newDealIds,
      };

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
      return;
    }

    // Déplacement vers une autre colonne
    const startDealIds = Array.from(startColumn.dealIds);
    startDealIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      dealIds: startDealIds,
    };

    const finishDealIds = Array.from(finishColumn.dealIds);
    finishDealIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      dealIds: finishDealIds,
    };

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  };

  return (
    <div className="h-[calc(100vh-140px)] w-full font-sans">
      
      {/* Detail Panel */}
      <ContactDetailPanel
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        {/* 
           Conteneur Principal : 
           - Mobile : Scroll horizontal + Snap + Padding + Gap
           - Desktop : Grille fixe
        */}
        <div className="flex md:grid md:grid-cols-4 gap-4 h-full overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 px-4 md:px-0 scroll-pl-4">
          
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const deals = column.dealIds.map((dealId) => data.deals[dealId]);

            return (
              <KanbanColumn 
                key={column.id} 
                columnId={column.id}
                title={column.title} 
                count={deals.length} 
                colorClass={column.color}
              >
                {deals.map((deal, index) => (
                  <div key={deal.id} onClick={() => handleDealClick(deal)}>
                    <DealCard 
                      deal={deal}
                      index={index}
                      // La carte prend la couleur de la colonne courante !
                      statusColor={column.color.cardBorder}
                    />
                  </div>
                ))}
              </KanbanColumn>
            );
          })}
          
        </div>
      </DragDropContext>
    </div>
  );
};

export default PipelinePage;

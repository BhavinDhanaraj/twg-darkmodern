import React from 'react';
import { useApp } from './context/AppContext';
import { Flex, Box } from '@chakra-ui/react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { KanbanTriageView } from './components/views/KanbanTriageView';
import { SplitWorkbenchView } from './components/views/SplitWorkbenchView';
import { ExceptionQueueView } from './components/views/ExceptionQueueView';
import { NotificationsView } from './components/views/NotificationsView';
import { AuditLogView } from './components/views/AuditLogView';
import { ConfigView } from './components/views/ConfigView';
import { ActionDrawer } from './components/common/ActionDrawer';
import { Chatbot } from './components/common/Chatbot';
import { ToastContainer } from './components/common/ToastContainer';

export const AppContent: React.FC = () => {
  const { activeNav } = useApp();

  const renderActiveView = () => {
    switch (activeNav) {
      case 'workbench':
        return <SplitWorkbenchView />;
      case 'kanban':
        return <KanbanTriageView />;
      case 'queue':
        return <ExceptionQueueView />;
      case 'notifications':
        return <NotificationsView />;
      case 'audit':
        return <AuditLogView />;
      case 'config':
        return <ConfigView />;
      default:
        return <SplitWorkbenchView />;
    }
  };

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg="bg-app">
      <Sidebar />
      <Flex direction="column" flex={1} h="100vh" overflow="hidden">
        <Topbar />
        <Box flex={1} overflowY="hidden" p={{ base: 2, md: 3 }} position="relative">
          {renderActiveView()}
        </Box>
      </Flex>
      <ActionDrawer />
      <Chatbot />
      <ToastContainer />
    </Flex>
  );
};

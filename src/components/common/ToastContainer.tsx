import React from 'react';
import { useApp } from '../../context/AppContext';
import { VStack, Flex, Text, HStack, Box } from '@chakra-ui/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  const getToastConfig = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle size={15} color="#F87171" />,
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          glow: '0 0 16px rgba(239, 68, 68, 0.3)',
          textColor: '#F8FAFC',
        };
      case 'warn':
        return {
          icon: <AlertTriangle size={15} color="#FBBF24" />,
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          glow: '0 0 16px rgba(245, 158, 11, 0.3)',
          textColor: '#F8FAFC',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={15} color="#34D399" />,
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          glow: '0 0 16px rgba(16, 185, 129, 0.3)',
          textColor: '#F8FAFC',
        };
      default:
        return {
          icon: <Info size={15} color="#38BDF8" />,
          bg: 'rgba(6, 182, 212, 0.15)',
          border: 'rgba(6, 182, 212, 0.4)',
          glow: '0 0 16px rgba(6, 182, 212, 0.3)',
          textColor: '#F8FAFC',
        };
    }
  };

  return (
    <VStack
      position="fixed"
      bottom="24px"
      left="24px"
      zIndex={500}
      align="flex-start"
      spacing={2}
      pointerEvents="none"
    >
      {toasts.map((t) => {
        const config = getToastConfig(t.type || '');
        return (
          <Box
            key={t.id}
            p="10px 14px"
            borderRadius="10px"
            bg="rgba(11, 17, 30, 0.95)"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={config.border}
            boxShadow={`0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), ${config.glow}`}
            maxW="380px"
            pointerEvents="auto"
            transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
          >
            <HStack spacing={2.5} align="center">
              {config.icon}
              <Text fontSize="12px" fontWeight="600" color={config.textColor}>
                {t.message}
              </Text>
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
};

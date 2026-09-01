import React from 'react';
import { Box, Flex, HStack, VStack, Text, Badge, Tooltip } from '@chakra-ui/react';
import {
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Activity,
  Layers,
} from 'lucide-react';

interface CommandSummaryStripProps {
  totalCount?: number;
  pendingCount?: number;
  terminalCount?: number;
  agedCount?: number;
  totalValue?: number;
  atRiskValue?: number;
  currentIndex?: number;
  onFilterClick?: (filterType: string) => void;
}

export const CommandSummaryStrip: React.FC<CommandSummaryStripProps> = ({
  totalCount = 66,
  pendingCount = 23,
  terminalCount = 6,
  agedCount = 11,
  totalValue = 3531400,
  atRiskValue = 1184200,
  currentIndex = 1,
  onFilterClick,
}) => {
  const fmtMoney = (v: number) => {
    if (v >= 1000000) return '$' + (v / 1000000).toFixed(2) + 'M';
    if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
    return '$' + Math.round(v).toLocaleString();
  };

  const metrics = [
    {
      id: 'capital',
      label: 'TOTAL EXPOSURE',
      value: fmtMoney(totalValue),
      subtext: `${totalCount} catalogue SKUs`,
      icon: <DollarSign size={14} />,
      color: '#34D399',
      borderGlow: 'rgba(16, 185, 129, 0.25)',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.02) 100%)',
    },
    {
      id: 'pending',
      label: 'PENDING TRIAGE',
      value: `${pendingCount}`,
      subtext: '48h Review SLA',
      icon: <Clock size={14} />,
      color: '#38BDF8',
      borderGlow: 'rgba(6, 182, 212, 0.25)',
      bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0.02) 100%)',
      badge: 'ACTION REQ',
      badgeColor: '#06B6D4',
    },
    {
      id: 'terminal',
      label: 'TERMINAL RISK',
      value: `${terminalCount}`,
      subtext: 'Critical write-off risk',
      icon: <ShieldAlert size={14} />,
      color: '#F87171',
      borderGlow: 'rgba(239, 68, 68, 0.3)',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.02) 100%)',
      badge: '>360 DAYS',
      badgeColor: '#EF4444',
    },
    {
      id: 'atrisk',
      label: 'AT-RISK VALUE',
      value: fmtMoney(atRiskValue),
      subtext: `${agedCount + terminalCount} aged/terminal items`,
      icon: <AlertTriangle size={14} />,
      color: '#FBBF24',
      borderGlow: 'rgba(245, 158, 11, 0.25)',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.02) 100%)',
    },
    {
      id: 'velocity',
      label: 'PORTFOLIO POSITION',
      value: `${currentIndex} OF ${totalCount}`,
      subtext: 'Focused workstation',
      icon: <Activity size={14} />,
      color: '#A78BFA',
      borderGlow: 'rgba(167, 139, 250, 0.25)',
      bgGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(167, 139, 250, 0.02) 100%)',
    },
  ];

  return (
    <Box
      w="100%"
      p="8px 12px"
      bg="rgba(10, 16, 28, 0.7)"
      backdropFilter="blur(16px)"
      borderRadius="12px"
      border="1px solid rgba(255, 255, 255, 0.07)"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
      mb={3}
    >
      <Flex
        gap={2.5}
        overflowX="auto"
        align="stretch"
        py={0.5}
        sx={{
          '&::-webkit-scrollbar': { height: '3px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.1)' },
        }}
      >
        {metrics.map((m) => (
          <Box
            key={m.id}
            flex="1"
            minW="165px"
            p="8px 12px"
            borderRadius="9px"
            bg={m.bgGradient}
            border="1px solid"
            borderColor={m.borderGlow}
            boxShadow={`inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 10px rgba(0, 0, 0, 0.2)`}
            cursor={onFilterClick ? 'pointer' : 'default'}
            onClick={() => onFilterClick && onFilterClick(m.id)}
            transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
            _hover={{
              transform: 'translateY(-1px)',
              borderColor: m.color,
              boxShadow: `0 0 16px ${m.borderGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
            }}
          >
            <Flex align="center" justify="space-between" mb={0.5}>
              <HStack spacing={1.5}>
                <Box color={m.color}>{m.icon}</Box>
                <Text
                  fontSize="9.5px"
                  fontWeight="700"
                  letterSpacing="0.06em"
                  color="#94A3B8"
                  textTransform="uppercase"
                >
                  {m.label}
                </Text>
              </HStack>
              {m.badge && (
                <Badge
                  bg={`rgba(255, 255, 255, 0.08)`}
                  color={m.badgeColor}
                  border={`1px solid ${m.badgeColor}40`}
                  fontSize="8px"
                  px={1}
                  py={0}
                  borderRadius="3px"
                  fontFamily="mono"
                >
                  {m.badge}
                </Badge>
              )}
            </Flex>

            <HStack align="baseline" justify="space-between">
              <Text
                fontSize="18px"
                fontWeight="800"
                color="#F8FAFC"
                fontFamily="mono"
                letterSpacing="-0.03em"
                lineHeight="1.2"
              >
                {m.value}
              </Text>
              <Text fontSize="10px" color="#64748B" noOfLines={1}>
                {m.subtext}
              </Text>
            </HStack>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

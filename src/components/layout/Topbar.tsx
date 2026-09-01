import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavKey } from '../../types';
import {
  Flex,
  Box,
  HStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import {
  Menu as MenuIcon,
  SplitSquareVertical,
  Kanban,
  Sparkles,
  Database,
  Radio,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

const PAGE_METADATA: Record<NavKey, { title: string; subtitle: string; code: string }> = {
  workbench: {
    title: 'Split-Screen Workbench',
    subtitle: 'High-throughput 2-pane triage & interactive markdown intelligence',
    code: 'WS-01',
  },
  kanban: {
    title: 'Kanban Pipeline',
    subtitle: 'Visual column-based governance with instantaneous card disposition',
    code: 'WS-02',
  },
  queue: {
    title: 'Exception Queue',
    subtitle: 'Prioritised stock ageing inventory ledger awaiting category sign-off',
    code: 'GOV-01',
  },
  notifications: {
    title: 'Notifications Hub',
    subtitle: 'Teams & Email automated dispatch telemetry with 48h SLA escalation',
    code: 'COM-01',
  },
  audit: {
    title: 'Audit & Compliance Log',
    subtitle: 'Cryptographic immutable ledger of reviewer decisions committed to Snowflake',
    code: 'AUD-01',
  },
  config: {
    title: 'Policy Thresholds',
    subtitle: 'Ageing policy source-of-truth matrix by operating model',
    code: 'CFG-01',
  },
};

export const Topbar: React.FC = () => {
  const { activeNav, navigate, toggleMobileMenu, apiConnected, toggleChat } = useApp();
  const currentMeta = PAGE_METADATA[activeNav] || PAGE_METADATA.workbench;

  return (
    <Flex
      as="header"
      h="54px"
      px={{ base: 3, md: 5 }}
      align="center"
      justify="space-between"
      bg="rgba(10, 16, 28, 0.75)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.08)"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.25)"
      position="sticky"
      top={0}
      zIndex={90}
    >
      {/* Page Title & Context */}
      <HStack spacing={3}>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          aria-label="Toggle navigation menu"
          icon={<MenuIcon size={18} />}
          variant="ghost"
          size="sm"
          color="#94A3B8"
          onClick={toggleMobileMenu}
        />
        <Box>
          <HStack spacing={2} align="center">
            <Badge
              bg="rgba(16, 185, 129, 0.15)"
              color="#34D399"
              border="1px solid rgba(16, 185, 129, 0.3)"
              fontSize="9px"
              px={1.5}
              borderRadius="3px"
              fontFamily="mono"
            >
              {currentMeta.code}
            </Badge>
            <Text
              fontWeight="800"
              fontSize="14px"
              color="#F8FAFC"
              letterSpacing="-0.02em"
              lineHeight="1.2"
            >
              {currentMeta.title}
            </Text>
          </HStack>
          <Text
            fontSize="11px"
            color="#94A3B8"
            display={{ base: 'none', lg: 'block' }}
            noOfLines={1}
          >
            {currentMeta.subtitle}
          </Text>
        </Box>
      </HStack>

      {/* Control Switchers & System Status */}
      <HStack spacing={3}>
        {/* Fast Switcher between Split Workbench and Kanban */}
        <ButtonGroup
          size="xs"
          isAttached
          variant="outline"
          borderRadius="8px"
          bg="rgba(14, 23, 38, 0.85)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          p="2px"
        >
          <Button
            size="xs"
            h="26px"
            px={2.5}
            bg={activeNav === 'workbench' ? '#10B981' : 'transparent'}
            color={activeNav === 'workbench' ? '#070B12' : '#94A3B8'}
            border="none"
            _hover={{
              bg: activeNav === 'workbench' ? '#34D399' : 'rgba(255, 255, 255, 0.06)',
              color: activeNav === 'workbench' ? '#070B12' : '#F8FAFC',
            }}
            boxShadow={
              activeNav === 'workbench'
                ? '0 0 12px rgba(16, 185, 129, 0.35)'
                : 'none'
            }
            onClick={() => navigate('workbench')}
            leftIcon={<SplitSquareVertical size={13} />}
            fontSize="11px"
            fontWeight={activeNav === 'workbench' ? '700' : '500'}
            borderRadius="6px"
          >
            Workbench
          </Button>
          <Button
            size="xs"
            h="26px"
            px={2.5}
            bg={activeNav === 'kanban' ? '#06B6D4' : 'transparent'}
            color={activeNav === 'kanban' ? '#070B12' : '#94A3B8'}
            border="none"
            _hover={{
              bg: activeNav === 'kanban' ? '#38BDF8' : 'rgba(255, 255, 255, 0.06)',
              color: activeNav === 'kanban' ? '#070B12' : '#F8FAFC',
            }}
            boxShadow={
              activeNav === 'kanban'
                ? '0 0 12px rgba(6, 182, 212, 0.35)'
                : 'none'
            }
            onClick={() => navigate('kanban')}
            leftIcon={<Kanban size={13} />}
            fontSize="11px"
            fontWeight={activeNav === 'kanban' ? '700' : '500'}
            borderRadius="6px"
          >
            Kanban
          </Button>
        </ButtonGroup>

        {/* Snowflake Pipeline Telemetry */}
        <Tooltip label="Snowflake Rule Engine & ERP Sync Pipeline Connected">
          <Badge
            bg="rgba(16, 185, 129, 0.1)"
            border="1px solid rgba(16, 185, 129, 0.25)"
            display={{ base: 'none', md: 'flex' }}
            alignItems="center"
            gap="6px"
            py={1}
            px={2.5}
            borderRadius="6px"
            cursor="default"
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg="#10B981"
              boxShadow="0 0 8px #10B981"
              className="animate-pulse-subtle"
            />
            <Text
              fontSize="10.5px"
              textTransform="none"
              fontWeight="700"
              color="#34D399"
              fontFamily="mono"
            >
              SNOWFLAKE SYNCED
            </Text>
          </Badge>
        </Tooltip>

        {/* AI Assistant trigger */}
        <Button
          size="xs"
          h="28px"
          px={2.5}
          bg="rgba(16, 185, 129, 0.12)"
          border="1px solid rgba(16, 185, 129, 0.3)"
          color="#34D399"
          _hover={{
            bg: 'rgba(16, 185, 129, 0.25)',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)',
          }}
          leftIcon={<Sparkles size={12} />}
          onClick={toggleChat}
          fontSize="11px"
          fontWeight="700"
          borderRadius="6px"
        >
          AI Copilot
        </Button>

        {/* User Pill */}
        <HStack
          spacing={2}
          bg="rgba(14, 23, 38, 0.7)"
          p="3px 8px 3px 4px"
          borderRadius="full"
          border="1px solid rgba(255, 255, 255, 0.08)"
          display={{ base: 'none', sm: 'flex' }}
        >
          <UserAvatar name="Brett Sharman" size="xs" presenceStatus="online" />
          <Box>
            <Text fontSize="11px" fontWeight="700" color="#F8FAFC" lineHeight="1">
              Brett S.
            </Text>
            <Text fontSize="9px" color="#94A3B8" lineHeight="1">
              Lead Approver
            </Text>
          </Box>
        </HStack>
      </HStack>
    </Flex>
  );
};

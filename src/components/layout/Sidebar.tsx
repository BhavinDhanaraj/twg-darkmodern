import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavKey } from '../../types';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import {
  ClipboardList,
  Bell,
  FileText,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Kanban,
  SplitSquareVertical,
  Activity,
  Database,
  Radio,
  Zap,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface NavGroup {
  label: string;
  items: {
    key: NavKey;
    label: string;
    icon: React.ReactNode;
    badgeText?: string;
    badgeScheme?: string;
    glowColor?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workstations',
    items: [
      {
        key: 'workbench',
        label: 'Split-Screen Workbench',
        icon: <SplitSquareVertical size={16} />,
        badgeText: 'MAIN',
        badgeScheme: 'green',
        glowColor: 'rgba(16, 185, 129, 0.4)',
      },
      {
        key: 'kanban',
        label: 'Kanban Board',
        icon: <Kanban size={16} />,
        badgeText: 'PIPELINE',
        badgeScheme: 'cyan',
        glowColor: 'rgba(6, 182, 212, 0.4)',
      },
    ],
  },
  {
    label: 'Governance & Tracking',
    items: [
      {
        key: 'queue',
        label: 'Exception Queue',
        icon: <ClipboardList size={16} />,
        badgeText: '66',
        badgeScheme: 'purple',
      },
      {
        key: 'notifications',
        label: 'Notifications Hub',
        icon: <Bell size={16} />,
      },
      {
        key: 'audit',
        label: 'Audit & Compliance',
        icon: <FileText size={16} />,
        badgeText: 'LEDGER',
        badgeScheme: 'blue',
      },
      {
        key: 'config',
        label: 'Policy Thresholds',
        icon: <SlidersHorizontal size={16} />,
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const {
    activeNav,
    navigate,
    notifications,
    exceptions,
    mobileMenuOpen,
    closeMobileMenu,
    apiConnected,
  } = useApp();

  const notAckCount = notifications.filter((n) => n.ack_status === 'Not Acknowledged').length;
  const pendingCount = exceptions.filter((e) => e.review_status === 'Pending').length;
  const terminalCount = exceptions.filter((e) => e.age_band === 'Terminal').length;

  return (
    <>
      {mobileMenuOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.700"
          backdropFilter="blur(8px)"
          zIndex={200}
          display={{ base: 'block', md: 'none' }}
          onClick={closeMobileMenu}
        />
      )}

      <Box
        as="aside"
        w="264px"
        h="100vh"
        bg="rgba(10, 16, 28, 0.85)"
        backdropFilter="blur(24px)"
        borderRight="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
        boxShadow="4px 0 24px rgba(0, 0, 0, 0.4)"
        display="flex"
        flexDirection="column"
        position={{ base: 'fixed', md: 'relative' }}
        left={{ base: mobileMenuOpen ? 0 : '-290px', md: 0 }}
        top={0}
        zIndex={{ base: 210, md: 100 }}
        transition="left 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        userSelect="none"
      >
        {/* Brand Header */}
        <Box
          px={5}
          py={4.5}
          borderBottom="1px solid"
          borderColor="rgba(255, 255, 255, 0.07)"
          bg="rgba(13, 20, 35, 0.5)"
        >
          <Flex align="center" justify="space-between">
            <HStack spacing={3}>
              <Flex
                w="38px"
                h="38px"
                borderRadius="10px"
                bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
                align="center"
                justify="center"
                color="#070B12"
                boxShadow="0 0 16px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)"
                flexShrink={0}
                position="relative"
              >
                <ShieldCheck size={20} strokeWidth={2.5} />
                <Box
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg="#34D399"
                  boxShadow="0 0 6px #34D399"
                  className="animate-pulse-subtle"
                />
              </Flex>
              <Box>
                <HStack spacing={1.5} align="center">
                  <Text
                    fontWeight="800"
                    fontSize="13px"
                    color="#F8FAFC"
                    letterSpacing="-0.01em"
                    lineHeight="1.2"
                  >
                    The Warehouse Group
                  </Text>
                </HStack>
                <HStack spacing={1.5} align="center" mt={0.5}>
                  <Text fontSize="10px" fontWeight="600" color="#94A3B8" letterSpacing="0.04em">
                    EXCEPTION MGMT
                  </Text>
                  <Badge
                    bg="rgba(16, 185, 129, 0.15)"
                    color="#34D399"
                    border="1px solid rgba(16, 185, 129, 0.3)"
                    fontSize="8px"
                    px={1}
                    py={0}
                    borderRadius="3px"
                  >
                    v4.2
                  </Badge>
                </HStack>
              </Box>
            </HStack>
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Close menu"
              icon={<X size={16} />}
              size="xs"
              variant="ghost"
              color="#94A3B8"
              onClick={closeMobileMenu}
            />
          </Flex>
        </Box>

        {/* Nav Items */}
        <VStack align="stretch" spacing={5} px={3} py={4} flex={1} overflowY="auto">
          {NAV_GROUPS.map((group) => (
            <Box key={group.label}>
              <Text
                fontSize="10px"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.08em"
                color="#64748B"
                px={3}
                mb={1.5}
              >
                {group.label}
              </Text>
              <VStack align="stretch" spacing={1}>
                {group.items.map((item) => {
                  const isActive = activeNav === item.key;
                  let badge = null;

                  if (item.key === 'notifications' && notAckCount > 0) {
                    badge = (
                      <HStack spacing={1}>
                        <Box
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg="#EF4444"
                          boxShadow="0 0 6px #EF4444"
                          className="animate-pulse-subtle"
                        />
                        <Badge
                          bg="rgba(239, 68, 68, 0.2)"
                          color="#F87171"
                          border="1px solid rgba(239, 68, 68, 0.4)"
                          fontSize="9px"
                          px={1.5}
                          borderRadius="full"
                        >
                          {notAckCount} unacked
                        </Badge>
                      </HStack>
                    );
                  } else if (item.badgeText) {
                    badge = (
                      <Badge
                        bg={
                          isActive
                            ? 'rgba(16, 185, 129, 0.2)'
                            : item.badgeScheme === 'cyan'
                            ? 'rgba(6, 182, 212, 0.15)'
                            : item.badgeScheme === 'purple'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'rgba(255, 255, 255, 0.08)'
                        }
                        color={
                          isActive
                            ? '#34D399'
                            : item.badgeScheme === 'cyan'
                            ? '#38BDF8'
                            : item.badgeScheme === 'purple'
                            ? '#C084FC'
                            : '#94A3B8'
                        }
                        border="1px solid"
                        borderColor={
                          isActive
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(255, 255, 255, 0.1)'
                        }
                        fontSize="9px"
                        px={1.5}
                        borderRadius="4px"
                      >
                        {item.badgeText}
                      </Badge>
                    );
                  }

                  return (
                    <HStack
                      key={item.key}
                      px={3}
                      py={2.5}
                      borderRadius="8px"
                      cursor="pointer"
                      bg={
                        isActive
                          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.03) 100%)'
                          : 'transparent'
                      }
                      color={isActive ? '#F8FAFC' : '#94A3B8'}
                      border="1px solid"
                      borderColor={isActive ? 'rgba(16, 185, 129, 0.35)' : 'transparent'}
                      boxShadow={
                        isActive
                          ? '0 0 16px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : 'none'
                      }
                      transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
                      _hover={{
                        bg: isActive
                          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)'
                          : 'rgba(255, 255, 255, 0.04)',
                        color: '#F8FAFC',
                        borderColor: isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                      }}
                      onClick={() => navigate(item.key)}
                      justify="space-between"
                    >
                      <HStack spacing={2.5}>
                        <Box
                          color={isActive ? '#34D399' : '#64748B'}
                          filter={isActive ? 'drop-shadow(0 0 4px rgba(52, 211, 153, 0.5))' : 'none'}
                          transition="color 0.15s"
                        >
                          {item.icon}
                        </Box>
                        <Text
                          fontSize="12.5px"
                          fontWeight={isActive ? '700' : '500'}
                          letterSpacing="-0.01em"
                        >
                          {item.label}
                        </Text>
                      </HStack>
                      {badge}
                    </HStack>
                  );
                })}
              </VStack>
            </Box>
          ))}
        </VStack>

        <Divider borderColor="rgba(255, 255, 255, 0.07)" />

        {/* Floating Glass Status Widget */}
        <Box p={3}>
          <Box
            p={3}
            borderRadius="10px"
            bg="rgba(14, 23, 38, 0.75)"
            border="1px solid rgba(255, 255, 255, 0.08)"
            boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.3)"
          >
            <Flex align="center" justify="space-between" mb={2}>
              <HStack spacing={1.5}>
                <Box
                  w="7px"
                  h="7px"
                  borderRadius="full"
                  bg={apiConnected ? '#10B981' : '#38BDF8'}
                  boxShadow={`0 0 8px ${apiConnected ? '#10B981' : '#38BDF8'}`}
                  className="animate-pulse-subtle"
                />
                <Text fontSize="10px" fontWeight="700" color="#F8FAFC" letterSpacing="0.02em">
                  SNOWFLAKE ENGINE
                </Text>
              </HStack>
              <Badge
                bg="rgba(16, 185, 129, 0.15)"
                color="#34D399"
                fontSize="9px"
                px={1.5}
                borderRadius="3px"
              >
                LIVE
              </Badge>
            </Flex>

            <HStack justify="space-between" mb={1}>
              <Text fontSize="11px" color="#94A3B8">
                Pending Triage:
              </Text>
              <Text fontSize="11px" fontWeight="700" color="#F8FAFC" fontFamily="mono">
                {pendingCount} SKUs
              </Text>
            </HStack>

            <HStack justify="space-between" mb={2}>
              <Text fontSize="11px" color="#94A3B8">
                Terminal Risk:
              </Text>
              <Text fontSize="11px" fontWeight="700" color="#F87171" fontFamily="mono">
                {terminalCount} items
              </Text>
            </HStack>

            <Flex
              pt={2}
              borderTop="1px solid rgba(255, 255, 255, 0.06)"
              align="center"
              justify="space-between"
            >
              <HStack spacing={2}>
                <UserAvatar name="Brett Sharman" size="xs" presenceStatus="online" />
                <Box>
                  <Text fontSize="10px" fontWeight="700" color="#F8FAFC" lineHeight="1.1">
                    Brett Sharman
                  </Text>
                  <Text fontSize="8.5px" color="#64748B" lineHeight="1.1">
                    Head of Planning
                  </Text>
                </Box>
              </HStack>
              <Tooltip label="48h Review SLA Enforced">
                <Badge
                  bg="rgba(6, 182, 212, 0.15)"
                  color="#38BDF8"
                  fontSize="8px"
                  px={1}
                  py={0.5}
                  borderRadius="3px"
                >
                  48h SLA
                </Badge>
              </Tooltip>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
};

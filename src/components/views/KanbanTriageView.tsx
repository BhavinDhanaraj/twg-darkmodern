import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AgeBand, ReviewStatus, ExceptionItem } from '../../types';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import {
  Search,
  Check,
  X,
  Send,
  Eye,
  Filter,
  Sliders,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { CommandSummaryStrip } from '../common/CommandSummaryStrip';

const BAND_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Terminal: { text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  Aged: { text: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
  Watch: { text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  Healthy: { text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
};

export const KanbanTriageView: React.FC = () => {
  const {
    exceptions,
    submitDecision,
    sendNotification,
    openDrawer,
    addToast,
    navigate,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOm, setSelectedOm] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'terminal' | 'aged' | 'highval'>('all');

  const valid = useMemo(() => exceptions.filter((e) => !e.dq_issue), [exceptions]);

  // Filtered exceptions
  const filtered = useMemo(() => {
    return valid.filter((e) => {
      if (selectedOm && e.operating_model !== selectedOm) return false;
      if (quickFilter === 'terminal' && e.age_band !== 'Terminal') return false;
      if (quickFilter === 'aged' && e.age_band !== 'Aged') return false;
      if (quickFilter === 'highval' && e.inv_value < 50000) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = `${e.sku} ${e.desc} ${e.category} ${e.reviewer} ${e.operating_model}`.toLowerCase();
        if (!match.includes(q)) return false;
      }
      return true;
    });
  }, [valid, selectedOm, quickFilter, searchTerm]);

  const fmtMoney = (v: number) => {
    if (v >= 1000000) return '$' + (v / 1000000).toFixed(2) + 'M';
    if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
    return '$' + Math.round(v).toLocaleString();
  };

  const columns: {
    status: ReviewStatus;
    label: string;
    description: string;
    glowColor: string;
    accentColor: string;
    bgHeader: string;
  }[] = [
    {
      status: 'Pending',
      label: 'PENDING TRIAGE',
      description: 'Awaiting reviewer decision',
      glowColor: 'rgba(6, 182, 212, 0.25)',
      accentColor: '#38BDF8',
      bgHeader: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.03) 100%)',
    },
    {
      status: 'Accepted',
      label: 'ACCEPTED MARKDOWN',
      description: 'Committed to clearance markdown',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      accentColor: '#34D399',
      bgHeader: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.03) 100%)',
    },
    {
      status: 'Modified',
      label: 'MODIFIED DIRECTIVE',
      description: 'Custom discount or redistribution',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      accentColor: '#FBBF24',
      bgHeader: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.03) 100%)',
    },
    {
      status: 'Rejected',
      label: 'REJECTED / RETAINED',
      description: 'Retained at standard full retail price',
      glowColor: 'rgba(239, 68, 68, 0.25)',
      accentColor: '#F87171',
      bgHeader: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.02) 100%)',
    },
    {
      status: 'Closed',
      label: 'RESOLVED / CLOSED',
      description: 'Completed in ERP & archived',
      glowColor: 'rgba(148, 163, 184, 0.2)',
      accentColor: '#94A3B8',
      bgHeader: 'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, rgba(148, 163, 184, 0.02) 100%)',
    },
  ];

  const handleMoveStatus = async (item: ExceptionItem, targetStatus: ReviewStatus) => {
    const defaultComment =
      targetStatus === 'Accepted'
        ? 'Quick triage: Approved standard SOP clearance markdown.'
        : targetStatus === 'Modified'
        ? 'Quick triage: Custom price modifier applied.'
        : targetStatus === 'Rejected'
        ? 'Quick triage: Stock retained at standard price.'
        : targetStatus === 'Closed'
        ? 'Action marked complete in ERP.'
        : 'Reopened for review.';

    await submitDecision(item.id, targetStatus, defaultComment);
  };

  return (
    <Flex direction="column" h="calc(100vh - 78px)" overflow="hidden">
      {/* Top Command Summary Strip */}
      <CommandSummaryStrip
        totalCount={valid.length}
        pendingCount={valid.filter((e) => e.review_status === 'Pending').length}
        terminalCount={valid.filter((e) => e.age_band === 'Terminal').length}
        agedCount={valid.filter((e) => e.age_band === 'Aged').length}
        totalValue={valid.reduce((acc, e) => acc + e.inv_value, 0)}
        atRiskValue={valid
          .filter((e) => e.age_band === 'Aged' || e.age_band === 'Terminal')
          .reduce((acc, e) => acc + e.inv_value, 0)}
      />

      {/* Filter Toolbar */}
      <Box
        p="8px 12px"
        borderRadius="10px"
        bg="rgba(13, 20, 33, 0.72)"
        backdropFilter="blur(16px)"
        border="1px solid rgba(255, 255, 255, 0.08)"
        mb={3}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <HStack spacing={2} flex={1} minW="260px">
            <InputGroup size="xs" maxW="300px">
              <InputLeftElement pointerEvents="none" children={<Search size={12} color="#64748B" />} />
              <Input
                placeholder="Filter Kanban by SKU, lead, category..."
                className="glass-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="6px"
                h="28px"
              />
            </InputGroup>

            <Select
              size="xs"
              h="28px"
              maxW="180px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.1)"
              value={selectedOm}
              onChange={(e) => setSelectedOm(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All Operating Models</option>
              <option value="Continuity Core">Continuity Core</option>
              <option value="Replen Tail">Replen Tail</option>
              <option value="Seasonal & Promo">Seasonal & Promo</option>
              <option value="Indent & Special">Indent & Special</option>
            </Select>
          </HStack>

          {/* Quick Presets */}
          <HStack spacing={1.5}>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'terminal', label: 'Terminal Only', color: '#F87171' },
              { id: 'aged', label: 'Aged Only', color: '#FB7185' },
              { id: 'highval', label: 'High Value (>$50K)', color: '#FBBF24' },
            ].map((chip) => (
              <Button
                key={chip.id}
                size="xs"
                h="24px"
                px={2.5}
                fontSize="10.5px"
                bg={quickFilter === chip.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)'}
                color={quickFilter === chip.id ? '#34D399' : chip.color || '#94A3B8'}
                border="1px solid"
                borderColor={quickFilter === chip.id ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
                onClick={() => setQuickFilter(chip.id as any)}
              >
                {chip.label}
              </Button>
            ))}
          </HStack>
        </Flex>
      </Box>

      {/* Kanban Board Columns Grid */}
      <Box flex={1} overflowX="auto" overflowY="hidden" pb={1}>
        <Flex gap={3} h="100%" minW="1200px">
          {columns.map((col) => {
            const colItems = filtered.filter((e) => e.review_status === col.status);
            const colValue = colItems.reduce((acc, e) => acc + e.inv_value, 0);

            return (
              <Box
                key={col.status}
                flex={1}
                minW="240px"
                maxW="340px"
                h="100%"
                display="flex"
                flexDirection="column"
                className="glass-panel"
                borderRadius="12px"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.08)"
                bg="rgba(10, 16, 28, 0.65)"
                overflow="hidden"
              >
                {/* Column Header */}
                <Box
                  p="10px 12px"
                  bg={col.bgHeader}
                  borderBottom="1px solid"
                  borderColor="rgba(255, 255, 255, 0.08)"
                >
                  <Flex align="center" justify="space-between" mb={1}>
                    <HStack spacing={2}>
                      <Box
                        w="7px"
                        h="7px"
                        borderRadius="full"
                        bg={col.accentColor}
                        boxShadow={`0 0 8px ${col.accentColor}`}
                      />
                      <Text
                        fontSize="11.5px"
                        fontWeight="800"
                        letterSpacing="0.04em"
                        color="#F8FAFC"
                        textTransform="uppercase"
                      >
                        {col.label}
                      </Text>
                    </HStack>

                    <Badge
                      bg="rgba(255, 255, 255, 0.08)"
                      color={col.accentColor}
                      border={`1px solid ${col.accentColor}40`}
                      fontSize="10px"
                      px={1.5}
                      py={0.5}
                      borderRadius="4px"
                      fontFamily="mono"
                    >
                      {colItems.length}
                    </Badge>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontSize="9.5px" color="#94A3B8" noOfLines={1}>
                      {col.description}
                    </Text>
                    <Text fontSize="11px" fontWeight="800" color="#34D399" fontFamily="mono">
                      {fmtMoney(colValue)}
                    </Text>
                  </Flex>
                </Box>

                {/* Cards Container */}
                <VStack
                  align="stretch"
                  spacing={2}
                  p={2.5}
                  flex={1}
                  overflowY="auto"
                  sx={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' },
                  }}
                >
                  {colItems.length === 0 ? (
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      h="120px"
                      border="1px dashed rgba(255, 255, 255, 0.08)"
                      borderRadius="8px"
                      color="#64748B"
                    >
                      <Text fontSize="11px">No SKUs in this column</Text>
                    </Flex>
                  ) : (
                    colItems.map((item) => {
                      const bandColor = BAND_COLORS[item.age_band] || BAND_COLORS.Healthy;

                      return (
                        <Box
                          key={item.id}
                          p="10px 12px"
                          borderRadius="8px"
                          bg="rgba(17, 26, 43, 0.75)"
                          backdropFilter="blur(12px)"
                          border="1px solid"
                          borderColor="rgba(255, 255, 255, 0.07)"
                          boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.25)"
                          transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                          _hover={{
                            bg: 'rgba(23, 35, 58, 0.85)',
                            borderColor: 'rgba(255, 255, 255, 0.18)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                          }}
                        >
                          {/* Header: SKU & Rank */}
                          <Flex align="center" justify="space-between" mb={1}>
                            <HStack spacing={1.5}>
                              <Text fontSize="9.5px" fontWeight="800" color="#64748B" fontFamily="mono">
                                #{item.priority_rank}
                              </Text>
                              <Text
                                fontSize="11px"
                                fontWeight="700"
                                color="#38BDF8"
                                fontFamily="mono"
                                cursor="pointer"
                                _hover={{ textDecoration: 'underline' }}
                                onClick={() => openDrawer(item.id)}
                              >
                                {item.sku}
                              </Text>
                            </HStack>

                            <Badge
                              bg={bandColor.bg}
                              color={bandColor.text}
                              border={`1px solid ${bandColor.border}`}
                              fontSize="8.5px"
                              px={1.5}
                              py={0}
                              borderRadius="3px"
                            >
                              {item.age_band} {item.age_days}d
                            </Badge>
                          </Flex>

                          {/* Item Description */}
                          <Text fontSize="12px" fontWeight="600" color="#F8FAFC" noOfLines={1} mb={1.5}>
                            {item.desc}
                          </Text>

                          {/* Value & Units */}
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontSize="10px" color="#94A3B8">
                              {item.units} units @ ${item.unit_cost.toFixed(2)}
                            </Text>
                            <Text fontSize="12px" fontWeight="800" color="#34D399" fontFamily="mono">
                              {fmtMoney(item.inv_value)}
                            </Text>
                          </Flex>

                          {/* AI Recommendation Quote */}
                          <Box
                            p="6px 8px"
                            borderRadius="6px"
                            bg="rgba(10, 16, 28, 0.6)"
                            border="1px solid rgba(255, 255, 255, 0.05)"
                            mb={2}
                          >
                            <Flex align="center" gap={1} mb={0.5}>
                              <Sparkles size={10} color="#38BDF8" />
                              <Text fontSize="9px" fontWeight="700" color="#38BDF8" textTransform="uppercase">
                                {item.recommended_action}
                              </Text>
                            </Flex>
                            <Text fontSize="9.5px" color="#94A3B8" noOfLines={2} lineHeight="1.3">
                              "{item.rationale}"
                            </Text>
                          </Box>

                          {/* Reviewer & Move Actions */}
                          <Flex align="center" justify="space-between" pt={1} borderTop="1px solid rgba(255, 255, 255, 0.06)">
                            <HStack spacing={1.5}>
                              <UserAvatar name={item.reviewer} size="xs" presenceStatus="online" />
                              <Text fontSize="10px" color="#94A3B8" noOfLines={1}>
                                {item.reviewer.split(' ')[0]}
                              </Text>
                            </HStack>

                            {/* Quick Action Buttons based on status */}
                            <HStack spacing={1}>
                              {col.status === 'Pending' && (
                                <>
                                  <Tooltip label="Accept Markdown">
                                    <IconButton
                                      aria-label="Accept"
                                      icon={<Check size={11} />}
                                      size="xs"
                                      h="22px"
                                      w="22px"
                                      bg="rgba(16, 185, 129, 0.2)"
                                      color="#34D399"
                                      border="1px solid rgba(16, 185, 129, 0.4)"
                                      _hover={{ bg: '#10B981', color: '#070B12' }}
                                      onClick={() => handleMoveStatus(item, 'Accepted')}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Modify Directive">
                                    <IconButton
                                      aria-label="Modify"
                                      icon={<Sliders size={11} />}
                                      size="xs"
                                      h="22px"
                                      w="22px"
                                      bg="rgba(245, 158, 11, 0.2)"
                                      color="#FBBF24"
                                      border="1px solid rgba(245, 158, 11, 0.4)"
                                      _hover={{ bg: '#F59E0B', color: '#070B12' }}
                                      onClick={() => handleMoveStatus(item, 'Modified')}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Reject Markdown">
                                    <IconButton
                                      aria-label="Reject"
                                      icon={<X size={11} />}
                                      size="xs"
                                      h="22px"
                                      w="22px"
                                      bg="rgba(239, 68, 68, 0.2)"
                                      color="#F87171"
                                      border="1px solid rgba(239, 68, 68, 0.4)"
                                      _hover={{ bg: '#EF4444', color: '#070B12' }}
                                      onClick={() => handleMoveStatus(item, 'Rejected')}
                                    />
                                  </Tooltip>
                                </>
                              )}

                              {col.status !== 'Pending' && (
                                <Tooltip label="Move back to Pending">
                                  <Button
                                    size="xs"
                                    h="20px"
                                    px={1.5}
                                    fontSize="9px"
                                    variant="ghost"
                                    color="#94A3B8"
                                    _hover={{ color: '#38BDF8' }}
                                    onClick={() => handleMoveStatus(item, 'Pending')}
                                  >
                                    Reopen
                                  </Button>
                                </Tooltip>
                              )}

                              <Tooltip label="Inspect in Detail">
                                <IconButton
                                  aria-label="Inspect"
                                  icon={<Eye size={11} />}
                                  size="xs"
                                  h="22px"
                                  w="22px"
                                  variant="ghost"
                                  color="#94A3B8"
                                  _hover={{ color: '#F8FAFC' }}
                                  onClick={() => openDrawer(item.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Flex>
                        </Box>
                      );
                    })
                  )}
                </VStack>
              </Box>
            );
          })}
        </Flex>
      </Box>
    </Flex>
  );
};

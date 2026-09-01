import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ExceptionItem, ReviewStatus, ChannelType, AgeBand } from '../../types';
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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Textarea,
  SimpleGrid,
  IconButton,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Progress,
} from '@chakra-ui/react';
import {
  Search,
  Check,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  MessageSquare,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Filter,
  Download,
  Keyboard,
  Copy,
  CheckCheck,
  Clock,
  MapPin,
  TrendingDown,
  DollarSign,
  Package,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  Layers,
  Sparkles,
  Database,
  ExternalLink,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { CommandSummaryStrip } from '../common/CommandSummaryStrip';

type QuickFilterType = 'all' | 'terminal' | 'aged' | 'pending' | 'high_value' | 'unacked';

const OM_THRESHOLDS: Record<string, { watch: number; aged: number; terminal: number }> = {
  'Continuity Core': { watch: 90, aged: 180, terminal: 360 },
  'Replen Tail': { watch: 180, aged: 360, terminal: 540 },
  'Seasonal & Promo': { watch: 60, aged: 120, terminal: 240 },
  'Indent & Special': { watch: 120, aged: 240, terminal: 450 },
};

const getBandColor = (b: AgeBand | string) => {
  switch (b) {
    case 'Terminal':
      return { text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.3)' };
    case 'Aged':
      return { text: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)', glow: 'rgba(244, 63, 94, 0.3)' };
    case 'Watch':
      return { text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' };
    case 'Healthy':
      return { text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', glow: 'rgba(16, 185, 129, 0.3)' };
    default:
      return { text: '#94A3B8', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.15)', glow: 'none' };
  }
};

const getStatusColor = (s: ReviewStatus | string) => {
  switch (s) {
    case 'Accepted':
      return { text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' };
    case 'Modified':
      return { text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
    case 'Rejected':
      return { text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' };
    case 'Closed':
      return { text: '#94A3B8', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.15)' };
    default:
      return { text: '#38BDF8', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' };
  }
};

export const SplitWorkbenchView: React.FC = () => {
  const {
    exceptions,
    notifications,
    auditLog,
    submitDecision,
    sendNotification,
    addToast,
  } = useApp();

  const valid = useMemo(() => exceptions.filter((e) => !e.dq_issue), [exceptions]);

  // Master selection & filters
  const [selectedId, setSelectedId] = useState<string>(valid[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [bandFilter, setBandFilter] = useState('');
  const [omFilter, setOmFilter] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'value_desc' | 'age_desc' | 'units_desc'>('priority');
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Right-pane interactive workbench states
  const [markdownPct, setMarkdownPct] = useState<number>(30);
  const [decisionChoice, setDecisionChoice] = useState<ReviewStatus | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [copiedSku, setCopiedSku] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shortcuts modal
  const { isOpen: isShortcutsOpen, onOpen: onOpenShortcuts, onClose: onCloseShortcuts } = useDisclosure();

  // Active exception item
  const activeExc = valid.find((e) => e.id === selectedId) || valid[0];
  const activeIndex = valid.findIndex((e) => e.id === (activeExc?.id || ''));

  // Reset form when active item changes
  useEffect(() => {
    if (activeExc) {
      setDecisionChoice(activeExc.review_status !== 'Pending' ? activeExc.review_status : null);
      setDecisionNote(activeExc.comment || '');
      // Dynamic markdown preset based on age band
      if (activeExc.age_band === 'Terminal') setMarkdownPct(50);
      else if (activeExc.age_band === 'Aged') setMarkdownPct(30);
      else if (activeExc.age_band === 'Watch') setMarkdownPct(15);
      else setMarkdownPct(0);
    }
  }, [activeExc?.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (activeIndex < valid.length - 1) setSelectedId(valid[activeIndex + 1].id);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (activeIndex > 0) setSelectedId(valid[activeIndex - 1].id);
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setDecisionChoice('Accepted');
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setDecisionChoice('Modified');
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setDecisionChoice('Rejected');
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setDecisionChoice('Pending');
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCommitDecision();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, valid, selectedId, decisionChoice, decisionNote]);

  // Filtered list
  const filtered = useMemo(() => {
    return valid
      .filter((e) => {
        if (quickFilter === 'terminal' && e.age_band !== 'Terminal') return false;
        if (quickFilter === 'aged' && e.age_band !== 'Aged') return false;
        if (quickFilter === 'pending' && e.review_status !== 'Pending') return false;
        if (quickFilter === 'high_value' && e.inv_value < 50000) return false;
        if (quickFilter === 'unacked') {
          const hasUnacked = notifications.some(
            (n) => n.exception_id === e.id && n.ack_status === 'Not Acknowledged'
          );
          if (!hasUnacked) return false;
        }

        if (statusFilter && e.review_status !== statusFilter) return false;
        if (bandFilter && e.age_band !== bandFilter) return false;
        if (omFilter && e.operating_model !== omFilter) return false;

        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const match = `${e.sku} ${e.desc} ${e.category} ${e.reviewer} ${e.operating_model}`.toLowerCase();
          if (!match.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') return a.priority_rank - b.priority_rank;
        if (sortBy === 'value_desc') return b.inv_value - a.inv_value;
        if (sortBy === 'age_desc') return b.age_days - a.age_days;
        if (sortBy === 'units_desc') return b.units - a.units;
        return 0;
      });
  }, [valid, quickFilter, statusFilter, bandFilter, omFilter, searchTerm, sortBy, notifications]);

  // Format helpers
  const fmtMoney = (v: number) => {
    if (v >= 1000000) return '$' + (v / 1000000).toFixed(2) + 'M';
    if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
    return '$' + Math.round(v).toLocaleString();
  };

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 2 }).format(v);

  // Clearance modeling math
  const clearancePrice = activeExc ? activeExc.unit_cost * (1 - markdownPct / 100) : 0;
  const grossRecovery = activeExc ? clearancePrice * activeExc.units : 0;
  const writeDownDelta = activeExc ? (clearancePrice - activeExc.unit_cost) * activeExc.units : 0;
  const estimatedVelocityDays = Math.max(7, Math.round(45 * (1 - markdownPct / 120)));

  // Commit decision handler
  const handleCommitDecision = async () => {
    if (!activeExc || !decisionChoice) {
      addToast('Please select a decision (Accept, Modify, Reject, or Pending)', 'warn');
      return;
    }

    setIsSubmitting(true);
    const commentToSubmit =
      decisionNote.trim() ||
      (decisionChoice === 'Accepted'
        ? `Approved ${markdownPct}% clearance markdown. Coordinate with merchandising ops.`
        : decisionChoice === 'Modified'
        ? `Modified to ${markdownPct}% targeted markdown for regional clearance.`
        : decisionChoice === 'Rejected'
        ? 'Stock retained at current retail price point; promo committed.'
        : 'Kept in pending triage for next cycle review.');

    await submitDecision(activeExc.id, decisionChoice, commentToSubmit);
    setIsSubmitting(false);

    if (autoAdvance && activeIndex < valid.length - 1) {
      setSelectedId(valid[activeIndex + 1].id);
    }
  };

  const handleCopySku = () => {
    if (activeExc) {
      navigator.clipboard.writeText(activeExc.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
      addToast(`Copied ${activeExc.sku} to clipboard`, 'success');
    }
  };

  const handleSendTeamsAlert = async () => {
    if (!activeExc) return;
    await sendNotification(activeExc.id, 'Teams', activeExc.reviewer);
  };

  const omThreshold = activeExc ? OM_THRESHOLDS[activeExc.operating_model] || { watch: 90, aged: 180, terminal: 360 } : { watch: 90, aged: 180, terminal: 360 };
  const agePercentOfTerminal = activeExc ? Math.min(100, Math.round((activeExc.age_days / omThreshold.terminal) * 100)) : 0;

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
        currentIndex={activeIndex + 1}
        onFilterClick={(type) => {
          if (type === 'terminal') setQuickFilter('terminal');
          else if (type === 'pending') setQuickFilter('pending');
          else if (type === 'atrisk') setQuickFilter('aged');
          else setQuickFilter('all');
        }}
      />

      {/* Main 2-Pane Split Workbench */}
      <Flex flex={1} gap={3} overflow="hidden" position="relative">
        {/* LEFT PANE: Exception Stream / Triage List */}
        <Box
          w={{ base: '100%', md: '360px', lg: '400px', xl: '420px' }}
          h="100%"
          display="flex"
          flexDirection="column"
          className="glass-panel"
          p={3}
          flexShrink={0}
        >
          {/* Header & Count */}
          <Flex align="center" justify="space-between" mb={2.5}>
            <HStack spacing={2}>
              <Box w="6px" h="6px" borderRadius="full" bg="#10B981" boxShadow="0 0 6px #10B981" />
              <Text fontSize="12px" fontWeight="800" letterSpacing="0.04em" color="#F8FAFC" textTransform="uppercase">
                EXCEPTION STREAM
              </Text>
              <Badge bg="rgba(16, 185, 129, 0.15)" color="#34D399" fontSize="10px" px={1.5} borderRadius="4px" fontFamily="mono">
                {filtered.length} of {valid.length}
              </Badge>
            </HStack>

            <Tooltip label="Keyboard Navigation (↑/↓ or j/k to navigate, a/m/r to decide)">
              <IconButton
                aria-label="Shortcuts"
                icon={<Keyboard size={13} />}
                size="xs"
                variant="ghost"
                color="#94A3B8"
                onClick={onOpenShortcuts}
              />
            </Tooltip>
          </Flex>

          {/* Search Box */}
          <InputGroup size="xs" mb={2}>
            <InputLeftElement pointerEvents="none" children={<Search size={12} color="#64748B" />} />
            <Input
              placeholder="Search SKU, description, category..."
              className="glass-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="6px"
              fontSize="11.5px"
              h="28px"
            />
            {searchTerm && (
              <IconButton
                aria-label="Clear"
                icon={<X size={11} />}
                size="xs"
                variant="ghost"
                position="absolute"
                right="2px"
                top="3px"
                onClick={() => setSearchTerm('')}
              />
            )}
          </InputGroup>

          {/* Quick Filter Presets */}
          <Flex gap={1} mb={2} wrap="wrap">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'terminal', label: 'Terminal', color: '#F87171' },
              { id: 'aged', label: 'Aged', color: '#FB7185' },
              { id: 'high_value', label: '>$50K', color: '#FBBF24' },
              { id: 'unacked', label: 'Unacked' },
            ].map((chip) => (
              <Button
                key={chip.id}
                size="xs"
                h="22px"
                px={2}
                fontSize="10px"
                borderRadius="4px"
                bg={quickFilter === chip.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)'}
                color={quickFilter === chip.id ? '#34D399' : chip.color || '#94A3B8'}
                border="1px solid"
                borderColor={quickFilter === chip.id ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.06)'}
                _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
                onClick={() => setQuickFilter(chip.id as QuickFilterType)}
              >
                {chip.label}
              </Button>
            ))}
          </Flex>

          {/* Sort & Filter Selectors */}
          <HStack spacing={2} mb={2.5}>
            <Select
              size="xs"
              h="24px"
              fontSize="10.5px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.08)"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              borderRadius="4px"
            >
              <option value="priority">Sort: Priority Rank #</option>
              <option value="value_desc">Sort: Risk Value ($)</option>
              <option value="age_desc">Sort: Age Exposure (Days)</option>
              <option value="units_desc">Sort: Units On Hand</option>
            </Select>

            <Select
              size="xs"
              h="24px"
              fontSize="10.5px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.08)"
              value={omFilter}
              onChange={(e) => setOmFilter(e.target.value)}
              borderRadius="4px"
            >
              <option value="">All Models</option>
              <option value="Continuity Core">Continuity Core</option>
              <option value="Replen Tail">Replen Tail</option>
              <option value="Seasonal & Promo">Seasonal & Promo</option>
              <option value="Indent & Special">Indent & Special</option>
            </Select>
          </HStack>

          {/* Scrollable Stream of Cards */}
          <VStack
            align="stretch"
            spacing={1.5}
            flex={1}
            overflowY="auto"
            pr={1}
            sx={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' },
            }}
          >
            {filtered.length === 0 ? (
              <Flex direction="column" align="center" justify="center" h="180px" color="#64748B">
                <Filter size={24} strokeWidth={1.5} />
                <Text fontSize="12px" mt={2}>
                  No matching exceptions found
                </Text>
                <Button size="xs" variant="ghost" color="#38BDF8" mt={1} onClick={() => { setQuickFilter('all'); setSearchTerm(''); setOmFilter(''); }}>
                  Reset all filters
                </Button>
              </Flex>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = item.id === activeExc?.id;
                const bandStyle = getBandColor(item.age_band);
                const statusStyle = getStatusColor(item.review_status);

                return (
                  <Box
                    key={item.id}
                    p="8px 10px"
                    borderRadius="8px"
                    bg={
                      isSelected
                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.05) 100%)'
                        : 'rgba(15, 23, 40, 0.55)'
                    }
                    border="1px solid"
                    borderColor={
                      isSelected
                        ? 'rgba(16, 185, 129, 0.5)'
                        : 'rgba(255, 255, 255, 0.06)'
                    }
                    boxShadow={
                      isSelected
                        ? '0 0 16px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                        : 'none'
                    }
                    cursor="pointer"
                    onClick={() => setSelectedId(item.id)}
                    transition="all 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
                    position="relative"
                    _hover={{
                      bg: isSelected
                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.08) 100%)'
                        : 'rgba(22, 34, 56, 0.7)',
                      borderColor: isSelected ? 'rgba(16, 185, 129, 0.6)' : 'rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {/* Left status indicator line */}
                    <Box
                      position="absolute"
                      left="0"
                      top="8px"
                      bottom="8px"
                      w="3px"
                      borderRadius="0 2px 2px 0"
                      bg={bandStyle.text}
                      boxShadow={item.age_band === 'Terminal' ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none'}
                    />

                    {/* Top Row: SKU & Priority Rank */}
                    <Flex align="center" justify="space-between" pl={1.5} mb={0.5}>
                      <HStack spacing={1.5}>
                        <Text fontSize="10px" fontWeight="800" color="#64748B" fontFamily="mono">
                          #{item.priority_rank}
                        </Text>
                        <Text fontSize="11px" fontWeight="700" color="#38BDF8" fontFamily="mono" letterSpacing="0.02em">
                          {item.sku}
                        </Text>
                      </HStack>

                      <Badge
                        bg={statusStyle.bg}
                        color={statusStyle.text}
                        border={`1px solid ${statusStyle.border}`}
                        fontSize="8.5px"
                        px={1.5}
                        py={0}
                        borderRadius="3px"
                      >
                        {item.review_status}
                      </Badge>
                    </Flex>

                    {/* Description */}
                    <Text fontSize="11.5px" fontWeight="600" color="#F8FAFC" pl={1.5} noOfLines={1} mb={1}>
                      {item.desc}
                    </Text>

                    {/* Metric Badges Row */}
                    <Flex align="center" justify="space-between" pl={1.5}>
                      <HStack spacing={1.5}>
                        <Badge
                          bg={bandStyle.bg}
                          color={bandStyle.text}
                          border={`1px solid ${bandStyle.border}`}
                          fontSize="8.5px"
                          px={1.5}
                          py={0}
                          borderRadius="3px"
                        >
                          {item.age_band} {item.age_days}d
                        </Badge>
                        <Text fontSize="10px" color="#94A3B8" fontFamily="mono">
                          {item.units} units
                        </Text>
                      </HStack>

                      <HStack spacing={1.5}>
                        <Text fontSize="11.5px" fontWeight="800" color="#34D399" fontFamily="mono">
                          {fmtMoney(item.inv_value)}
                        </Text>
                        <UserAvatar name={item.reviewer} size="xs" showPresence={false} />
                      </HStack>
                    </Flex>
                  </Box>
                );
              })
            )}
          </VStack>
        </Box>

        {/* RIGHT PANE: Intelligence & Decision Workspace */}
        {activeExc ? (
          <Box
            flex={1}
            h="100%"
            display="flex"
            flexDirection="column"
            className="glass-panel"
            p={3.5}
            overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': { width: '5px' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' },
            }}
          >
            {/* Header Hero Card */}
            <Box
              p="12px 14px"
              borderRadius="10px"
              bg="linear-gradient(135deg, rgba(17, 26, 45, 0.85) 0%, rgba(13, 20, 35, 0.7) 100%)"
              border="1px solid rgba(255, 255, 255, 0.09)"
              boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.25)"
              mb={3}
            >
              <Flex align="flex-start" justify="space-between" wrap="wrap" gap={2}>
                <Box>
                  <HStack spacing={2} align="center" mb={1}>
                    <Badge
                      bg="rgba(6, 182, 212, 0.15)"
                      color="#38BDF8"
                      border="1px solid rgba(6, 182, 212, 0.3)"
                      fontSize="11px"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                      fontFamily="mono"
                      cursor="pointer"
                      onClick={handleCopySku}
                      _hover={{ bg: 'rgba(6, 182, 212, 0.25)' }}
                    >
                      {copiedSku ? 'COPIED ✓' : `#${activeExc.priority_rank} · ${activeExc.sku}`}
                    </Badge>

                    <Badge
                      bg={getBandColor(activeExc.age_band).bg}
                      color={getBandColor(activeExc.age_band).text}
                      border={`1px solid ${getBandColor(activeExc.age_band).border}`}
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                    >
                      {activeExc.age_band} ({activeExc.age_days} DAYS OLD)
                    </Badge>

                    <Badge
                      bg="rgba(255, 255, 255, 0.07)"
                      color="#94A3B8"
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                    >
                      {activeExc.operating_model}
                    </Badge>
                  </HStack>

                  <Text fontSize="16px" fontWeight="800" color="#F8FAFC" letterSpacing="-0.02em">
                    {activeExc.desc}
                  </Text>
                  <Text fontSize="11px" color="#94A3B8" mt={0.5}>
                    Category: <Text as="span" color="#E2E8F0" fontWeight="600">{activeExc.category}</Text> · Operating Model: <Text as="span" color="#E2E8F0" fontWeight="600">{activeExc.operating_model}</Text>
                  </Text>
                </Box>

                {/* Assigned Reviewer & Prev/Next */}
                <HStack spacing={2.5}>
                  <HStack
                    spacing={2}
                    bg="rgba(10, 16, 28, 0.6)"
                    p="4px 10px"
                    borderRadius="8px"
                    border="1px solid rgba(255, 255, 255, 0.08)"
                  >
                    <UserAvatar name={activeExc.reviewer} size="sm" presenceStatus="online" />
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#F8FAFC" lineHeight="1.1">
                        {activeExc.reviewer}
                      </Text>
                      <Text fontSize="9px" color="#64748B" lineHeight="1.1">
                        Assigned Category Lead
                      </Text>
                    </Box>
                  </HStack>

                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Previous SKU"
                      icon={<ArrowLeft size={14} />}
                      size="xs"
                      variant="outline"
                      borderColor="rgba(255, 255, 255, 0.12)"
                      color="#94A3B8"
                      isDisabled={activeIndex <= 0}
                      onClick={() => setSelectedId(valid[activeIndex - 1].id)}
                    />
                    <IconButton
                      aria-label="Next SKU"
                      icon={<ArrowRight size={14} />}
                      size="xs"
                      variant="outline"
                      borderColor="rgba(255, 255, 255, 0.12)"
                      color="#94A3B8"
                      isDisabled={activeIndex >= valid.length - 1}
                      onClick={() => setSelectedId(valid[activeIndex + 1].id)}
                    />
                  </HStack>
                </HStack>
              </Flex>
            </Box>

            {/* 4 Glass Metric Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2.5} mb={3}>
              <Box
                p="10px 12px"
                borderRadius="8px"
                bg="rgba(14, 23, 38, 0.65)"
                border="1px solid rgba(255, 255, 255, 0.08)"
                boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.06)"
              >
                <Text fontSize="10px" fontWeight="700" color="#94A3B8" letterSpacing="0.04em">
                  UNITS ON HAND
                </Text>
                <Text fontSize="18px" fontWeight="800" color="#F8FAFC" fontFamily="mono">
                  {activeExc.units.toLocaleString()}
                </Text>
                <Text fontSize="10px" color="#64748B" fontFamily="mono">
                  @ {fmtCurrency(activeExc.unit_cost)} unit cost
                </Text>
              </Box>

              <Box
                p="10px 12px"
                borderRadius="8px"
                bg="rgba(14, 23, 38, 0.65)"
                border="1px solid rgba(255, 255, 255, 0.08)"
                boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.06)"
              >
                <Text fontSize="10px" fontWeight="700" color="#94A3B8" letterSpacing="0.04em">
                  UNIT LANDED COST
                </Text>
                <Text fontSize="18px" fontWeight="800" color="#38BDF8" fontFamily="mono">
                  {fmtCurrency(activeExc.unit_cost)}
                </Text>
                <Text fontSize="10px" color="#64748B">
                  Landed inventory value
                </Text>
              </Box>

              <Box
                p="10px 12px"
                borderRadius="8px"
                bg="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)"
                border="1px solid rgba(16, 185, 129, 0.25)"
                boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 12px rgba(16, 185, 129, 0.1)"
              >
                <Text fontSize="10px" fontWeight="700" color="#34D399" letterSpacing="0.04em">
                  TOTAL CAPITAL RISK
                </Text>
                <Text fontSize="18px" fontWeight="800" color="#34D399" fontFamily="mono">
                  {fmtMoney(activeExc.inv_value)}
                </Text>
                <Text fontSize="10px" color="#94A3B8" fontFamily="mono">
                  Exact: {fmtCurrency(activeExc.inv_value)}
                </Text>
              </Box>

              <Box
                p="10px 12px"
                borderRadius="8px"
                bg="rgba(14, 23, 38, 0.65)"
                border="1px solid rgba(255, 255, 255, 0.08)"
                boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.06)"
              >
                <Flex justify="space-between" align="center">
                  <Text fontSize="10px" fontWeight="700" color="#94A3B8" letterSpacing="0.04em">
                    AGE / TERMINAL
                  </Text>
                  <Text fontSize="9px" color="#F87171" fontFamily="mono">
                    {agePercentOfTerminal}%
                  </Text>
                </Flex>
                <Text fontSize="18px" fontWeight="800" color="#F8FAFC" fontFamily="mono">
                  {activeExc.age_days}d / {omThreshold.terminal}d
                </Text>
                <Progress
                  value={agePercentOfTerminal}
                  size="xs"
                  borderRadius="full"
                  mt={1.5}
                  bg="rgba(255, 255, 255, 0.08)"
                  colorScheme={agePercentOfTerminal > 80 ? 'red' : agePercentOfTerminal > 50 ? 'yellow' : 'green'}
                />
              </Box>
            </SimpleGrid>

            {/* AI Recommendation Panel */}
            <Box
              p="12px 14px"
              borderRadius="10px"
              bg="linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.06) 100%)"
              border="1px solid rgba(6, 182, 212, 0.3)"
              boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(6, 182, 212, 0.12)"
              mb={3}
            >
              <Flex align="center" justify="space-between" mb={2}>
                <HStack spacing={2}>
                  <Flex
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg="rgba(6, 182, 212, 0.25)"
                    align="center"
                    justify="center"
                    color="#38BDF8"
                  >
                    <Sparkles size={12} />
                  </Flex>
                  <Text fontSize="11px" fontWeight="800" letterSpacing="0.06em" color="#38BDF8" textTransform="uppercase">
                    AI CLEARANCE INTELLIGENCE
                  </Text>
                </HStack>

                <HStack spacing={2}>
                  <Badge bg="rgba(6, 182, 212, 0.2)" color="#38BDF8" fontSize="9px" px={1.5} borderRadius="3px" fontFamily="mono">
                    AI CONFIDENCE 96%
                  </Badge>
                  <Badge bg="rgba(16, 185, 129, 0.2)" color="#34D399" fontSize="9px" px={1.5} borderRadius="3px">
                    RECOMMENDED ACTION
                  </Badge>
                </HStack>
              </Flex>

              <Flex align="baseline" gap={2} mb={1.5}>
                <Text fontSize="13.5px" fontWeight="800" color="#F8FAFC" letterSpacing="-0.01em">
                  {activeExc.recommended_action}
                </Text>
              </Flex>

              <Text fontSize="11.5px" color="#94A3B8" lineHeight="1.5" mb={2}>
                "{activeExc.rationale}"
              </Text>

              {/* Signals Indicator Row */}
              <Flex gap={2} wrap="wrap" pt={1.5} borderTop="1px solid rgba(255, 255, 255, 0.08)">
                <HStack spacing={1} bg="rgba(10, 16, 28, 0.5)" px={2} py={1} borderRadius="4px">
                  <Text fontSize="9.5px" color="#64748B">Velocity Score:</Text>
                  <Text fontSize="9.5px" fontWeight="700" color="#34D399" fontFamily="mono">8.4/10</Text>
                </HStack>
                <HStack spacing={1} bg="rgba(10, 16, 28, 0.5)" px={2} py={1} borderRadius="4px">
                  <Text fontSize="9.5px" color="#64748B">Holding Cost Delta:</Text>
                  <Text fontSize="9.5px" fontWeight="700" color="#FBBF24" fontFamily="mono">$142/mo</Text>
                </HStack>
                <HStack spacing={1} bg="rgba(10, 16, 28, 0.5)" px={2} py={1} borderRadius="4px">
                  <Text fontSize="9.5px" color="#64748B">Elasticity Factor:</Text>
                  <Text fontSize="9.5px" fontWeight="700" color="#38BDF8" fontFamily="mono">1.35x</Text>
                </HStack>
                <HStack spacing={1} bg="rgba(10, 16, 28, 0.5)" px={2} py={1} borderRadius="4px">
                  <Text fontSize="9.5px" color="#64748B">Snowflake Model:</Text>
                  <Text fontSize="9.5px" fontWeight="700" color="#A78BFA" fontFamily="mono">BR-001/v4</Text>
                </HStack>
              </Flex>
            </Box>

            {/* Interactive Clearance Modeler */}
            <Box
              p="12px 14px"
              borderRadius="10px"
              bg="rgba(14, 23, 38, 0.75)"
              border="1px solid rgba(255, 255, 255, 0.09)"
              boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.25)"
              mb={3}
            >
              <Flex align="center" justify="space-between" mb={2}>
                <HStack spacing={2}>
                  <Sliders size={13} color="#34D399" />
                  <Text fontSize="11px" fontWeight="800" letterSpacing="0.06em" color="#F8FAFC" textTransform="uppercase">
                    INTERACTIVE CLEARANCE MODELER
                  </Text>
                </HStack>

                <HStack spacing={1.5}>
                  <Badge
                    bg="rgba(16, 185, 129, 0.2)"
                    color="#34D399"
                    border="1px solid rgba(16, 185, 129, 0.4)"
                    fontSize="11px"
                    px={2}
                    py={0.5}
                    borderRadius="4px"
                    fontFamily="mono"
                  >
                    {markdownPct}% DISCOUNT
                  </Badge>
                </HStack>
              </Flex>

              {/* Slider */}
              <Box px={1} py={2} mb={2}>
                <Slider
                  aria-label="markdown-slider"
                  value={markdownPct}
                  min={0}
                  max={80}
                  step={5}
                  onChange={(val) => setMarkdownPct(val)}
                >
                  <SliderTrack bg="rgba(255, 255, 255, 0.1)" h="6px" borderRadius="full">
                    <SliderFilledTrack bg="linear-gradient(90deg, #10B981 0%, #06B6D4 100%)" />
                  </SliderTrack>
                  <SliderThumb
                    boxSize="18px"
                    bg="#F8FAFC"
                    border="2px solid #10B981"
                    boxShadow="0 0 10px rgba(16, 185, 129, 0.6)"
                  />
                </Slider>
              </Box>

              {/* Preset Chips */}
              <HStack spacing={2} mb={3}>
                {[
                  { pct: 0, label: '0% Standard' },
                  { pct: 15, label: '15% Promo' },
                  { pct: 30, label: '30% SOP Standard' },
                  { pct: 50, label: '50% Clearance' },
                  { pct: 70, label: '70% Liquidation' },
                ].map((p) => (
                  <Button
                    key={p.pct}
                    size="xs"
                    h="22px"
                    px={2}
                    fontSize="10px"
                    borderRadius="4px"
                    bg={markdownPct === p.pct ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)'}
                    color={markdownPct === p.pct ? '#34D399' : '#94A3B8'}
                    border="1px solid"
                    borderColor={markdownPct === p.pct ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                    onClick={() => setMarkdownPct(p.pct)}
                  >
                    {p.label}
                  </Button>
                ))}
              </HStack>

              {/* Modeler Real-Time Computed Outflow */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                <Box p="8px 10px" borderRadius="6px" bg="rgba(10, 16, 28, 0.6)" border="1px solid rgba(255, 255, 255, 0.06)">
                  <Text fontSize="9px" color="#94A3B8">CLEARANCE PRICE</Text>
                  <Text fontSize="14px" fontWeight="800" color="#38BDF8" fontFamily="mono">
                    {fmtCurrency(clearancePrice)}
                  </Text>
                  <Text fontSize="9px" color="#64748B">/ unit</Text>
                </Box>

                <Box p="8px 10px" borderRadius="6px" bg="rgba(10, 16, 28, 0.6)" border="1px solid rgba(255, 255, 255, 0.06)">
                  <Text fontSize="9px" color="#94A3B8">GROSS RECOVERY</Text>
                  <Text fontSize="14px" fontWeight="800" color="#34D399" fontFamily="mono">
                    {fmtMoney(grossRecovery)}
                  </Text>
                  <Text fontSize="9px" color="#64748B">Est. revenue</Text>
                </Box>

                <Box p="8px 10px" borderRadius="6px" bg="rgba(10, 16, 28, 0.6)" border="1px solid rgba(255, 255, 255, 0.06)">
                  <Text fontSize="9px" color="#94A3B8">WRITE-DOWN LOSS</Text>
                  <Text fontSize="14px" fontWeight="800" color={writeDownDelta < 0 ? '#F87171' : '#94A3B8'} fontFamily="mono">
                    {writeDownDelta < 0 ? `-${fmtMoney(Math.abs(writeDownDelta))}` : '$0'}
                  </Text>
                  <Text fontSize="9px" color="#64748B">Margin hit</Text>
                </Box>

                <Box p="8px 10px" borderRadius="6px" bg="rgba(10, 16, 28, 0.6)" border="1px solid rgba(255, 255, 255, 0.06)">
                  <Text fontSize="9px" color="#94A3B8">EST. VELOCITY</Text>
                  <Text fontSize="14px" fontWeight="800" color="#FBBF24" fontFamily="mono">
                    {estimatedVelocityDays} Days
                  </Text>
                  <Text fontSize="9px" color="#64748B">To stock-out</Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Category Lead Sign-Off (Decision Workspace) */}
            <Box
              p="14px 16px"
              borderRadius="10px"
              bg="rgba(15, 24, 40, 0.85)"
              border="1px solid rgba(16, 185, 129, 0.3)"
              boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(16, 185, 129, 0.15)"
              mb={3}
            >
              <Flex align="center" justify="space-between" mb={2.5}>
                <HStack spacing={2}>
                  <ShieldCheck size={15} color="#34D399" />
                  <Text fontSize="12px" fontWeight="800" letterSpacing="0.06em" color="#F8FAFC" textTransform="uppercase">
                    CATEGORY LEAD SIGN-OFF
                  </Text>
                </HStack>

                <HStack spacing={3}>
                  <FormControl display="flex" alignItems="center" w="auto">
                    <FormLabel htmlFor="auto-advance" mb="0" fontSize="10px" color="#94A3B8" mr={1.5}>
                      Auto-Advance Next
                    </FormLabel>
                    <Switch
                      id="auto-advance"
                      size="sm"
                      colorScheme="brand"
                      isChecked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                    />
                  </FormControl>
                </HStack>
              </Flex>

              {/* 4 Decision Buttons */}
              <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2} mb={3}>
                {[
                  {
                    status: 'Accepted' as ReviewStatus,
                    label: 'ACCEPT (A)',
                    color: '#34D399',
                    bgActive: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    borderActive: '#34D399',
                    icon: <Check size={14} />,
                  },
                  {
                    status: 'Modified' as ReviewStatus,
                    label: 'MODIFY (M)',
                    color: '#FBBF24',
                    bgActive: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                    borderActive: '#FBBF24',
                    icon: <Sliders size={14} />,
                  },
                  {
                    status: 'Rejected' as ReviewStatus,
                    label: 'REJECT (R)',
                    color: '#F87171',
                    bgActive: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                    borderActive: '#F87171',
                    icon: <X size={14} />,
                  },
                  {
                    status: 'Pending' as ReviewStatus,
                    label: 'PENDING (P)',
                    color: '#38BDF8',
                    bgActive: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
                    borderActive: '#38BDF8',
                    icon: <Clock size={14} />,
                  },
                ].map((btn) => {
                  const isChosen = decisionChoice === btn.status;
                  return (
                    <Button
                      key={btn.status}
                      size="sm"
                      h="36px"
                      fontSize="11.5px"
                      fontWeight="700"
                      bg={isChosen ? btn.bgActive : 'rgba(255, 255, 255, 0.04)'}
                      color={isChosen ? '#070B12' : btn.color}
                      border="1px solid"
                      borderColor={isChosen ? btn.borderActive : 'rgba(255, 255, 255, 0.1)'}
                      boxShadow={isChosen ? `0 0 16px ${btn.color}50` : 'none'}
                      leftIcon={btn.icon}
                      _hover={{
                        bg: isChosen ? btn.bgActive : 'rgba(255, 255, 255, 0.08)',
                        borderColor: btn.color,
                      }}
                      onClick={() => setDecisionChoice(btn.status)}
                    >
                      {btn.label}
                    </Button>
                  );
                })}
              </SimpleGrid>

              {/* Directive Note & Audit Commentary */}
              <Box mb={3}>
                <Text fontSize="10.5px" fontWeight="600" color="#94A3B8" mb={1}>
                  Directive & Compliance Commentary:
                </Text>
                <Textarea
                  placeholder="Enter specific markdown directive or rationale for audit trail..."
                  className="glass-input"
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  rows={2}
                  fontSize="11.5px"
                  borderRadius="6px"
                />
              </Box>

              {/* Action Buttons */}
              <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    h="34px"
                    px={3}
                    variant="outline"
                    borderColor="rgba(6, 182, 212, 0.4)"
                    color="#38BDF8"
                    _hover={{ bg: 'rgba(6, 182, 212, 0.15)' }}
                    leftIcon={<Send size={13} />}
                    onClick={handleSendTeamsAlert}
                    fontSize="11px"
                  >
                    Teams Alert
                  </Button>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    size="sm"
                    h="34px"
                    px={4}
                    bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
                    color="#070B12"
                    fontWeight="800"
                    fontSize="12px"
                    _hover={{
                      bg: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      boxShadow: '0 0 18px rgba(16, 185, 129, 0.5)',
                    }}
                    boxShadow="0 0 12px rgba(16, 185, 129, 0.35)"
                    leftIcon={<Database size={14} />}
                    isLoading={isSubmitting}
                    onClick={handleCommitDecision}
                  >
                    Commit to Snowflake (⌘+Enter)
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {/* Deep-Dive Tabs (DC Breakdown, SLA Timeline, SOP Reference) */}
            <Box
              borderRadius="10px"
              bg="rgba(14, 23, 38, 0.65)"
              border="1px solid rgba(255, 255, 255, 0.08)"
              p={3}
            >
              <Tabs index={activeTab} onChange={(index) => setActiveTab(index)} variant="soft-rounded" size="xs">
                <TabList mb={2.5}>
                  <Tab
                    _selected={{ color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                    color="#94A3B8"
                    fontSize="10.5px"
                    fontWeight="700"
                  >
                    Facility & DC Breakdown
                  </Tab>
                  <Tab
                    _selected={{ color: '#38BDF8', bg: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)' }}
                    color="#94A3B8"
                    fontSize="10.5px"
                    fontWeight="700"
                  >
                    SLA & Audit Trail ({auditLog.filter((a) => a.sku === activeExc.sku).length})
                  </Tab>
                  <Tab
                    _selected={{ color: '#C084FC', bg: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                    color="#94A3B8"
                    fontSize="10.5px"
                    fontWeight="700"
                  >
                    SOP Policy Reference
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* DC Breakdown */}
                  <TabPanel p={1}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                      {[
                        { dc: 'Auckland DC 801', units: Math.round(activeExc.units * 0.52), pct: 52, days: activeExc.age_days },
                        { dc: 'Palmerston North DC 802', units: Math.round(activeExc.units * 0.31), pct: 31, days: Math.round(activeExc.age_days * 0.9) },
                        { dc: 'Christchurch DC 803', units: Math.round(activeExc.units * 0.17), pct: 17, days: Math.round(activeExc.age_days * 1.1) },
                      ].map((loc) => (
                        <Box key={loc.dc} p="8px 10px" borderRadius="6px" bg="rgba(10, 16, 28, 0.5)" border="1px solid rgba(255, 255, 255, 0.06)">
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="10px" fontWeight="700" color="#F8FAFC">{loc.dc}</Text>
                            <Badge bg="rgba(255, 255, 255, 0.08)" color="#94A3B8" fontSize="8px">{loc.pct}%</Badge>
                          </Flex>
                          <HStack justify="space-between">
                            <Text fontSize="12px" fontWeight="800" color="#38BDF8" fontFamily="mono">
                              {loc.units.toLocaleString()} units
                            </Text>
                            <Text fontSize="10px" color="#64748B">
                              Avg {loc.days}d old
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </TabPanel>

                  {/* Audit Trail */}
                  <TabPanel p={1}>
                    <VStack align="stretch" spacing={1.5}>
                      {auditLog
                        .filter((a) => a.sku === activeExc.sku)
                        .map((entry) => (
                          <HStack
                            key={entry.id}
                            p="6px 8px"
                            borderRadius="6px"
                            bg="rgba(10, 16, 28, 0.5)"
                            justify="space-between"
                            fontSize="10.5px"
                          >
                            <HStack spacing={2}>
                              <UserAvatar name={entry.actor} size="xs" showPresence={false} />
                              <Box>
                                <Text fontWeight="700" color="#F8FAFC">{entry.actor}</Text>
                                <Text color="#64748B">{new Date(entry.timestamp).toLocaleString()}</Text>
                              </Box>
                            </HStack>
                            <HStack spacing={2}>
                              <Badge bg={getStatusColor(entry.action).bg} color={getStatusColor(entry.action).text} fontSize="9px">
                                {entry.action}
                              </Badge>
                              <Text color="#94A3B8" maxW="200px" noOfLines={1}>
                                {entry.comment}
                              </Text>
                            </HStack>
                          </HStack>
                        ))}
                      {auditLog.filter((a) => a.sku === activeExc.sku).length === 0 && (
                        <Text fontSize="11px" color="#64748B" textAlign="center" py={2}>
                          No prior decisions logged for this SKU yet.
                        </Text>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* SOP Policy Reference */}
                  <TabPanel p={1}>
                    <Box p="8px 10px" borderRadius="6px" bg="rgba(10, 16, 28, 0.5)" border="1px solid rgba(255, 255, 255, 0.06)">
                      <Text fontSize="11px" fontWeight="700" color="#F8FAFC" mb={1}>
                        Stock Ageing SOP Rule: {activeExc.operating_model}
                      </Text>
                      <Text fontSize="10.5px" color="#94A3B8" lineHeight="1.5">
                        Under BR-001, {activeExc.operating_model} items transition to Watch at {omThreshold.watch}d, Aged at {omThreshold.aged}d, and Terminal at {omThreshold.terminal}d.
                        Reviewer decisions are recorded into the Snowflake governance ledger without executing automated ERP write-backs (BR-006 Human-in-the-loop control).
                      </Text>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Box>
        ) : (
          <Flex flex={1} align="center" justify="center" className="glass-panel">
            <Text color="#94A3B8">Select an exception from the stream</Text>
          </Flex>
        )}
      </Flex>

      {/* Shortcuts Help Modal */}
      <Modal isOpen={isShortcutsOpen} onClose={onCloseShortcuts} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent bg="#0F172A" border="1px solid rgba(255, 255, 255, 0.12)" color="#F8FAFC" borderRadius="12px">
          <ModalHeader fontSize="sm" fontWeight="800" borderBottom="1px solid rgba(255, 255, 255, 0.08)">
            Keyboard Navigation & Shortcuts
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack align="stretch" spacing={2.5} fontSize="11.5px">
              <HStack justify="space-between">
                <Text color="#94A3B8">Next Exception</Text>
                <Badge bg="rgba(255, 255, 255, 0.1)" color="#F8FAFC">↓ or J</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="#94A3B8">Previous Exception</Text>
                <Badge bg="rgba(255, 255, 255, 0.1)" color="#F8FAFC">↑ or K</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="#94A3B8">Accept Markdown</Text>
                <Badge bg="rgba(16, 185, 129, 0.2)" color="#34D399">A</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="#94A3B8">Modify Directive</Text>
                <Badge bg="rgba(245, 158, 11, 0.2)" color="#FBBF24">M</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="#94A3B8">Reject Markdown</Text>
                <Badge bg="rgba(239, 68, 68, 0.2)" color="#F87171">R</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="#94A3B8">Keep Pending</Text>
                <Badge bg="rgba(6, 182, 212, 0.2)" color="#38BDF8">P</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="#94A3B8">Commit Decision</Text>
                <Badge bg="rgba(16, 185, 129, 0.2)" color="#34D399">⌘+Enter / Ctrl+Enter</Badge>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

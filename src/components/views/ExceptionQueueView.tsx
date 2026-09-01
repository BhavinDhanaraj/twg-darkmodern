import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AgeBand, ReviewStatus, OperatingModel } from '../../types';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
} from '@chakra-ui/react';
import {
  Search,
  Check,
  X,
  Send,
  Eye,
  Sliders,
  Filter,
  Download,
  MoreVertical,
  Layers,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { CommandSummaryStrip } from '../common/CommandSummaryStrip';

const BAND_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Terminal: { text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  Aged: { text: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
  Watch: { text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  Healthy: { text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
};

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Accepted: { text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
  Modified: { text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  Rejected: { text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  Pending: { text: '#38BDF8', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' },
  Closed: { text: '#94A3B8', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.15)' },
};

export const ExceptionQueueView: React.FC = () => {
  const { exceptions, submitDecision, openDrawer, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [bandFilter, setBandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [omFilter, setOmFilter] = useState('');
  const [reviewerFilter, setReviewerFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'rank' | 'value' | 'age' | 'units'>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const valid = useMemo(() => exceptions.filter((e) => !e.dq_issue), [exceptions]);

  const filtered = useMemo(() => {
    return valid
      .filter((e) => {
        if (bandFilter && e.age_band !== bandFilter) return false;
        if (statusFilter && e.review_status !== statusFilter) return false;
        if (omFilter && e.operating_model !== omFilter) return false;
        if (reviewerFilter && e.reviewer !== reviewerFilter) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const match = `${e.sku} ${e.desc} ${e.category} ${e.reviewer} ${e.operating_model}`.toLowerCase();
          if (!match.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'rank') diff = a.priority_rank - b.priority_rank;
        else if (sortField === 'value') diff = a.inv_value - b.inv_value;
        else if (sortField === 'age') diff = a.age_days - b.age_days;
        else if (sortField === 'units') diff = a.units - b.units;
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [valid, bandFilter, statusFilter, omFilter, reviewerFilter, searchTerm, sortField, sortDir]);

  const reviewers = useMemo(() => Array.from(new Set(valid.map((e) => e.reviewer))), [valid]);

  const fmtMoney = (v: number) =>
    new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(v);

  const handleToggleSort = (field: 'rank' | 'value' | 'age' | 'units') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filtered.map((e) => e.id));
    else setSelectedIds([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkAccept = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await submitDecision(id, 'Accepted', 'Bulk approval of standard markdown.');
    }
    setSelectedIds([]);
    addToast(`Bulk approved ${selectedIds.length} exceptions`, 'success');
  };

  const handleExportCsv = () => {
    const headers = ['Priority Rank', 'SKU', 'Description', 'Category', 'Operating Model', 'Age Band', 'Age Days', 'Units', 'Unit Cost', 'Inventory Value', 'Reviewer', 'Review Status', 'AI Recommendation'];
    const rows = filtered.map((e) => [
      e.priority_rank,
      e.sku,
      `"${e.desc.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.operating_model}"`,
      e.age_band,
      e.age_days,
      e.units,
      e.unit_cost,
      e.inv_value,
      `"${e.reviewer}"`,
      e.review_status,
      `"${e.recommended_action}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TWG_Exception_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Exported Exception Queue to CSV', 'success');
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

      {/* Filter & Action Toolbar */}
      <Box
        p="10px 14px"
        borderRadius="10px"
        bg="rgba(13, 20, 33, 0.72)"
        backdropFilter="blur(16px)"
        border="1px solid rgba(255, 255, 255, 0.08)"
        mb={3}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <HStack spacing={2} flex={1} minW="320px">
            <InputGroup size="xs" maxW="260px">
              <InputLeftElement pointerEvents="none" children={<Search size={12} color="#64748B" />} />
              <Input
                placeholder="Search exceptions..."
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
              maxW="140px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.1)"
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All Age Bands</option>
              <option value="Terminal">Terminal</option>
              <option value="Aged">Aged</option>
              <option value="Watch">Watch</option>
              <option value="Healthy">Healthy</option>
            </Select>

            <Select
              size="xs"
              h="28px"
              maxW="140px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.1)"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Modified">Modified</option>
              <option value="Rejected">Rejected</option>
            </Select>

            <Select
              size="xs"
              h="28px"
              maxW="160px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.1)"
              value={reviewerFilter}
              onChange={(e) => setReviewerFilter(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All Reviewers</option>
              {reviewers.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </HStack>

          {/* Bulk Action & Export */}
          <HStack spacing={2}>
            {selectedIds.length > 0 && (
              <Button
                size="xs"
                h="28px"
                px={2.5}
                bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
                color="#070B12"
                fontWeight="700"
                onClick={handleBulkAccept}
                leftIcon={<Check size={12} />}
              >
                Approve Selected ({selectedIds.length})
              </Button>
            )}

            <Button
              size="xs"
              h="28px"
              px={2.5}
              variant="outline"
              borderColor="rgba(255, 255, 255, 0.12)"
              color="#E2E8F0"
              leftIcon={<FileSpreadsheet size={13} />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Table Container */}
      <Box
        flex={1}
        className="glass-panel"
        borderRadius="12px"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <Box
          flex={1}
          overflowY="auto"
          sx={{
            '&::-webkit-scrollbar': { width: '5px' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' },
          }}
        >
          <Table variant="simple" size="sm">
            <Thead
              position="sticky"
              top={0}
              bg="#0B111E"
              zIndex={2}
              borderBottom="1px solid rgba(255, 255, 255, 0.09)"
            >
              <Tr>
                <Th w="40px" px={3}>
                  <Checkbox
                    size="sm"
                    colorScheme="brand"
                    isChecked={selectedIds.length === filtered.length && filtered.length > 0}
                    isIndeterminate={selectedIds.length > 0 && selectedIds.length < filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </Th>
                <Th cursor="pointer" onClick={() => handleToggleSort('rank')}>
                  <HStack spacing={1}>
                    <Text>Rank</Text>
                    <ArrowUpDown size={11} />
                  </HStack>
                </Th>
                <Th>SKU & Description</Th>
                <Th>Category / Model</Th>
                <Th cursor="pointer" onClick={() => handleToggleSort('age')}>
                  <HStack spacing={1}>
                    <Text>Age Band</Text>
                    <ArrowUpDown size={11} />
                  </HStack>
                </Th>
                <Th isNumeric cursor="pointer" onClick={() => handleToggleSort('units')}>
                  <HStack spacing={1} justify="flex-end">
                    <Text>Units</Text>
                    <ArrowUpDown size={11} />
                  </HStack>
                </Th>
                <Th isNumeric cursor="pointer" onClick={() => handleToggleSort('value')}>
                  <HStack spacing={1} justify="flex-end">
                    <Text>Risk Value</Text>
                    <ArrowUpDown size={11} />
                  </HStack>
                </Th>
                <Th>Reviewer</Th>
                <Th>Status</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((item) => {
                const bandColor = BAND_COLORS[item.age_band] || BAND_COLORS.Healthy;
                const statusColor = STATUS_COLORS[item.review_status] || STATUS_COLORS.Pending;
                const isSelected = selectedIds.includes(item.id);
                const isTerminal = item.age_band === 'Terminal';

                return (
                  <Tr
                    key={item.id}
                    bg={
                      isSelected
                        ? 'rgba(16, 185, 129, 0.1)'
                        : isTerminal
                        ? 'rgba(239, 68, 68, 0.04)'
                        : 'transparent'
                    }
                    borderBottom="1px solid rgba(255, 255, 255, 0.05)"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.04)' }}
                    transition="background 0.15s"
                  >
                    <Td px={3}>
                      <Checkbox
                        size="sm"
                        colorScheme="brand"
                        isChecked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                      />
                    </Td>

                    <Td fontFamily="mono" fontSize="11px" fontWeight="700" color="#64748B">
                      #{item.priority_rank}
                    </Td>

                    <Td>
                      <VStack align="flex-start" spacing={0.5}>
                        <Text
                          fontSize="12px"
                          fontWeight="700"
                          color="#38BDF8"
                          fontFamily="mono"
                          cursor="pointer"
                          _hover={{ textDecoration: 'underline' }}
                          onClick={() => openDrawer(item.id)}
                        >
                          {item.sku}
                        </Text>
                        <Text fontSize="11.5px" color="#F8FAFC" noOfLines={1} maxW="240px">
                          {item.desc}
                        </Text>
                      </VStack>
                    </Td>

                    <Td>
                      <VStack align="flex-start" spacing={0.5}>
                        <Text fontSize="11px" color="#E2E8F0" fontWeight="600">
                          {item.category}
                        </Text>
                        <Text fontSize="10px" color="#94A3B8">
                          {item.operating_model}
                        </Text>
                      </VStack>
                    </Td>

                    <Td>
                      <Badge
                        bg={bandColor.bg}
                        color={bandColor.text}
                        border={`1px solid ${bandColor.border}`}
                        fontSize="9px"
                        px={1.5}
                        py={0.5}
                        borderRadius="3px"
                      >
                        {item.age_band} ({item.age_days}d)
                      </Badge>
                    </Td>

                    <Td isNumeric fontFamily="mono" fontSize="11.5px" color="#E2E8F0">
                      {item.units.toLocaleString()}
                    </Td>

                    <Td isNumeric fontFamily="mono" fontSize="12px" fontWeight="800" color="#34D399">
                      {fmtMoney(item.inv_value)}
                    </Td>

                    <Td>
                      <HStack spacing={1.5}>
                        <UserAvatar name={item.reviewer} size="xs" presenceStatus="online" />
                        <Text fontSize="11px" color="#E2E8F0" noOfLines={1}>
                          {item.reviewer}
                        </Text>
                      </HStack>
                    </Td>

                    <Td>
                      <Badge
                        bg={statusColor.bg}
                        color={statusColor.text}
                        border={`1px solid ${statusColor.border}`}
                        fontSize="9px"
                        px={1.5}
                        py={0.5}
                        borderRadius="3px"
                      >
                        {item.review_status}
                      </Badge>
                    </Td>

                    <Td textAlign="right">
                      <HStack spacing={1} justify="flex-end">
                        <Tooltip label="Accept Markdown">
                          <IconButton
                            aria-label="Accept"
                            icon={<Check size={11} />}
                            size="xs"
                            variant="ghost"
                            color="#34D399"
                            _hover={{ bg: 'rgba(16, 185, 129, 0.2)' }}
                            onClick={() => submitDecision(item.id, 'Accepted', 'Quick queue accept.')}
                          />
                        </Tooltip>
                        <Tooltip label="Reject Markdown">
                          <IconButton
                            aria-label="Reject"
                            icon={<X size={11} />}
                            size="xs"
                            variant="ghost"
                            color="#F87171"
                            _hover={{ bg: 'rgba(239, 68, 68, 0.2)' }}
                            onClick={() => submitDecision(item.id, 'Rejected', 'Quick queue reject.')}
                          />
                        </Tooltip>
                        <Tooltip label="Inspect Drawer">
                          <IconButton
                            aria-label="Inspect"
                            icon={<Eye size={11} />}
                            size="xs"
                            variant="ghost"
                            color="#94A3B8"
                            _hover={{ color: '#F8FAFC' }}
                            onClick={() => openDrawer(item.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Flex>
  );
};

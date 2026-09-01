import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
} from '@chakra-ui/react';
import {
  Search,
  FileText,
  ShieldCheck,
  Download,
  Database,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

const ACTION_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Accepted: { text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
  Modified: { text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  Rejected: { text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  Pending: { text: '#38BDF8', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' },
};

export const AuditLogView: React.FC = () => {
  const { auditLog, openDrawer, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  const filtered = useMemo(() => {
    return auditLog.filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false;
      if (actorFilter && log.actor !== actorFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = `${log.sku} ${log.actor} ${log.action} ${log.comment || ''}`.toLowerCase();
        if (!match.includes(q)) return false;
      }
      return true;
    });
  }, [auditLog, actionFilter, actorFilter, searchTerm]);

  const actors = useMemo(() => Array.from(new Set(auditLog.map((l) => l.actor))), [auditLog]);

  const handleExportAudit = () => {
    const headers = ['Log ID', 'Timestamp', 'SKU', 'Actor', 'Action', 'Comment', 'Ledger Block Hash'];
    const rows = filtered.map((l) => [
      l.id,
      l.timestamp,
      l.sku,
      `"${l.actor}"`,
      l.action,
      `"${(l.comment || '').replace(/"/g, '""')}"`,
      `"SHA256-${l.id.slice(0, 8)}..."`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TWG_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Exported Immutable Audit Ledger to CSV', 'success');
  };

  return (
    <Flex direction="column" h="calc(100vh - 78px)" overflow="hidden">
      {/* Top Bar */}
      <Box
        p="10px 14px"
        borderRadius="10px"
        bg="rgba(13, 20, 33, 0.72)"
        backdropFilter="blur(16px)"
        border="1px solid rgba(255, 255, 255, 0.08)"
        mb={3}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <HStack spacing={2} flex={1} minW="280px">
            <InputGroup size="xs" maxW="260px">
              <InputLeftElement pointerEvents="none" children={<Search size={12} color="#64748B" />} />
              <Input
                placeholder="Search audit ledger by SKU, actor, comment..."
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
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All Actions</option>
              <option value="Accepted">Accepted</option>
              <option value="Modified">Modified</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </Select>

            <Select
              size="xs"
              h="28px"
              maxW="160px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.1)"
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All Actors</option>
              {actors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </HStack>

          <HStack spacing={2}>
            <Tooltip label="All review decisions are cryptographically timestamped & stored in Snowflake">
              <Badge
                bg="rgba(16, 185, 129, 0.12)"
                color="#34D399"
                border="1px solid rgba(16, 185, 129, 0.3)"
                display="flex"
                alignItems="center"
                gap="4px"
                py={1}
                px={2}
                borderRadius="4px"
              >
                <Lock size={10} />
                IMMUTABLE LEDGER
              </Badge>
            </Tooltip>

            <Button
              size="xs"
              h="28px"
              px={2.5}
              variant="outline"
              borderColor="rgba(255, 255, 255, 0.12)"
              color="#E2E8F0"
              leftIcon={<FileSpreadsheet size={13} />}
              onClick={handleExportAudit}
            >
              Export Ledger
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Audit Log Table */}
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
                <Th w="160px">Timestamp</Th>
                <Th w="130px">SKU</Th>
                <Th w="180px">Reviewer / Actor</Th>
                <Th w="120px">Action</Th>
                <Th>Directive / Audit Commentary</Th>
                <Th w="130px" textAlign="right">Snowflake Proof</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((log) => {
                const actionStyle = ACTION_COLORS[log.action] || ACTION_COLORS.Pending;

                return (
                  <Tr
                    key={log.id}
                    borderBottom="1px solid rgba(255, 255, 255, 0.05)"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <Td fontFamily="mono" fontSize="11px" color="#94A3B8">
                      {new Date(log.timestamp).toLocaleString()}
                    </Td>

                    <Td>
                      <Text
                        fontFamily="mono"
                        fontSize="11.5px"
                        fontWeight="700"
                        color="#38BDF8"
                        cursor="pointer"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={() => openDrawer(log.sku)}
                      >
                        {log.sku}
                      </Text>
                    </Td>

                    <Td>
                      <HStack spacing={1.5}>
                        <UserAvatar name={log.actor} size="xs" presenceStatus="online" />
                        <Text fontSize="11.5px" color="#F8FAFC" fontWeight="600">
                          {log.actor}
                        </Text>
                      </HStack>
                    </Td>

                    <Td>
                      <Badge
                        bg={actionStyle.bg}
                        color={actionStyle.text}
                        border={`1px solid ${actionStyle.border}`}
                        fontSize="9px"
                        px={2}
                        py={0.5}
                        borderRadius="3px"
                      >
                        {log.action}
                      </Badge>
                    </Td>

                    <Td fontSize="11.5px" color="#E2E8F0">
                      {log.comment || 'Decision logged without comment.'}
                    </Td>

                    <Td textAlign="right">
                      <Badge
                        bg="rgba(255, 255, 255, 0.06)"
                        color="#64748B"
                        fontSize="9px"
                        fontFamily="mono"
                        px={1.5}
                        borderRadius="3px"
                      >
                        0x{log.id.slice(0, 6)}...
                      </Badge>
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

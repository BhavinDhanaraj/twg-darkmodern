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
  IconButton,
} from '@chakra-ui/react';
import {
  Search,
  Check,
  Mail,
  MessageSquare,
  Eye,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const NotificationsView: React.FC = () => {
  const { notifications, resendNotification, escalateNotification, openDrawer, submitDecision, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [ackFilter, setAckFilter] = useState<string>('');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (channelFilter && n.channel !== channelFilter) return false;
      if (ackFilter && n.ack_status !== ackFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = `${n.sku} ${n.recipient} ${n.channel}`.toLowerCase();
        if (!match.includes(q)) return false;
      }
      return true;
    });
  }, [notifications, channelFilter, ackFilter, searchTerm]);

  const notAckCount = notifications.filter((n) => n.ack_status === 'Not Acknowledged').length;
  const escalatedCount = notifications.filter((n) => n.escalated).length;

  const handleAcknowledge = async (item: typeof notifications[0]) => {
    await submitDecision(item.exception_id, 'Accepted', 'SLA Acknowledged by operator.');
    addToast(`SLA stop acknowledged for ${item.sku}`, 'success');
  };

  return (
    <Flex direction="column" h="calc(100vh - 78px)" overflow="hidden">
      {/* Top Command Summary Strip */}
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
                placeholder="Search notification telemetry..."
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
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All Channels</option>
              <option value="Teams">MS Teams</option>
              <option value="Email">Email SMTP</option>
            </Select>

            <Select
              size="xs"
              h="28px"
              maxW="160px"
              bg="rgba(14, 23, 38, 0.85)"
              borderColor="rgba(255, 255, 255, 0.1)"
              value={ackFilter}
              onChange={(e) => setAckFilter(e.target.value)}
              borderRadius="6px"
            >
              <option value="">All SLA Statuses</option>
              <option value="Not Acknowledged">Not Acknowledged ({notAckCount})</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Delivered">Delivered</option>
            </Select>
          </HStack>

          <HStack spacing={2}>
            <Badge bg="rgba(239, 68, 68, 0.15)" color="#F87171" border="1px solid rgba(239, 68, 68, 0.3)" px={2} py={1} borderRadius="4px">
              Escalations: {escalatedCount}
            </Badge>
            <Badge bg="rgba(6, 182, 212, 0.15)" color="#38BDF8" border="1px solid rgba(6, 182, 212, 0.3)" px={2} py={1} borderRadius="4px">
              Total Dispatches: {notifications.length}
            </Badge>
          </HStack>
        </Flex>
      </Box>

      {/* Notifications List */}
      <Box
        flex={1}
        className="glass-panel"
        borderRadius="12px"
        p={3}
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' },
        }}
      >
        <VStack align="stretch" spacing={2.5}>
          {filtered.map((item) => {
            const isUnacked = item.ack_status === 'Not Acknowledged';
            const isEscalated = item.escalated;

            return (
              <Box
                key={item.id}
                p="12px 14px"
                borderRadius="10px"
                bg={
                  isEscalated
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(17, 26, 43, 0.7) 100%)'
                    : isUnacked
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 26, 43, 0.7) 100%)'
                    : 'rgba(17, 26, 43, 0.65)'
                }
                border="1px solid"
                borderColor={
                  isEscalated
                    ? 'rgba(239, 68, 68, 0.35)'
                    : isUnacked
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(255, 255, 255, 0.07)'
                }
                boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.2)"
                transition="all 0.18s"
                _hover={{
                  borderColor: isEscalated ? '#F87171' : 'rgba(255, 255, 255, 0.18)',
                }}
              >
                <Flex align="flex-start" justify="space-between" wrap="wrap" gap={2}>
                  {/* Left Column: Icon, Recipient, Message */}
                  <HStack spacing={3} align="flex-start">
                    <Flex
                      w="34px"
                      h="34px"
                      borderRadius="8px"
                      bg={
                        item.channel === 'Teams'
                          ? 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)'
                          : 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)'
                      }
                      color="#ffffff"
                      align="center"
                      justify="center"
                      boxShadow="0 0 10px rgba(99, 102, 241, 0.3)"
                      flexShrink={0}
                    >
                      {item.channel === 'Teams' ? <MessageSquare size={16} /> : <Mail size={16} />}
                    </Flex>

                    <Box>
                      <HStack spacing={2} mb={0.5}>
                        <Badge
                          bg="rgba(6, 182, 212, 0.15)"
                          color="#38BDF8"
                          border="1px solid rgba(6, 182, 212, 0.3)"
                          fontSize="10px"
                          fontFamily="mono"
                          cursor="pointer"
                          onClick={() => openDrawer(item.exception_id)}
                        >
                          {item.sku}
                        </Badge>

                        <Badge
                          bg={
                            item.channel === 'Teams'
                              ? 'rgba(99, 102, 241, 0.2)'
                              : 'rgba(14, 165, 233, 0.2)'
                          }
                          color={item.channel === 'Teams' ? '#818CF8' : '#38BDF8'}
                          fontSize="9px"
                        >
                          {item.channel} DISPATCH
                        </Badge>

                        <Badge
                          bg={
                            isEscalated
                              ? 'rgba(239, 68, 68, 0.2)'
                              : isUnacked
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)'
                          }
                          color={isEscalated ? '#F87171' : isUnacked ? '#FBBF24' : '#34D399'}
                          border="1px solid"
                          borderColor={isEscalated ? '#F87171' : isUnacked ? '#FBBF24' : '#34D399'}
                          fontSize="9px"
                        >
                          {item.ack_status}
                        </Badge>

                        {isEscalated && (
                          <Badge bg="rgba(239, 68, 68, 0.25)" color="#F87171" fontSize="9px">
                            ESCALATED
                          </Badge>
                        )}
                      </HStack>

                      <Text fontSize="13px" fontWeight="700" color="#F8FAFC" mb={1}>
                        Stock Ageing Alert & Markdown Proposal for {item.sku}
                      </Text>

                      <HStack spacing={3} fontSize="11px" color="#94A3B8">
                        <HStack spacing={1.5}>
                          <UserAvatar name={item.recipient} size="xs" presenceStatus="online" />
                          <Text>
                            Recipient:{' '}
                            <Text as="span" color="#F8FAFC" fontWeight="600">
                              {item.recipient}
                            </Text>
                          </Text>
                        </HStack>
                        <Text>·</Text>
                        <Text>Sent: {new Date(item.sent_time).toLocaleString()}</Text>
                        {item.ack_time && (
                          <>
                            <Text>·</Text>
                            <Text color="#34D399">Acked: {new Date(item.ack_time).toLocaleTimeString()}</Text>
                          </>
                        )}
                        {item.resend_count > 0 && (
                          <>
                            <Text>·</Text>
                            <Text color="#FBBF24">Resent x{item.resend_count}</Text>
                          </>
                        )}
                      </HStack>
                    </Box>
                  </HStack>

                  {/* Right Column: Actions */}
                  <HStack spacing={2} align="center">
                    {isUnacked && (
                      <Button
                        size="xs"
                        h="28px"
                        px={3}
                        bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
                        color="#070B12"
                        fontWeight="700"
                        leftIcon={<Check size={12} />}
                        onClick={() => handleAcknowledge(item)}
                      >
                        Acknowledge SLA
                      </Button>
                    )}

                    <Button
                      size="xs"
                      h="28px"
                      px={2.5}
                      variant="outline"
                      borderColor="rgba(255, 255, 255, 0.12)"
                      color="#E2E8F0"
                      leftIcon={<RefreshCw size={11} />}
                      onClick={() => resendNotification(item.id)}
                    >
                      Resend
                    </Button>

                    {!isEscalated && (
                      <Button
                        size="xs"
                        h="28px"
                        px={2.5}
                        variant="outline"
                        borderColor="rgba(239, 68, 68, 0.4)"
                        color="#F87171"
                        _hover={{ bg: 'rgba(239, 68, 68, 0.15)' }}
                        leftIcon={<ArrowUpRight size={12} />}
                        onClick={() => escalateNotification(item.id)}
                      >
                        Escalate
                      </Button>
                    )}

                    <IconButton
                      aria-label="Inspect"
                      icon={<Eye size={12} />}
                      size="xs"
                      h="28px"
                      variant="ghost"
                      color="#94A3B8"
                      onClick={() => openDrawer(item.exception_id)}
                    />
                  </HStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Flex>
  );
};

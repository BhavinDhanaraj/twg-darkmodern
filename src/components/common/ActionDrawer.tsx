import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ReviewStatus, ChannelType } from '../../types';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  IconButton,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  Divider,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import {
  X,
  Send,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Check,
  Sliders,
  Clock,
  Mail,
  MessageSquare,
  Database,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

const BAND_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Terminal: { text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  Aged: { text: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
  Watch: { text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  Healthy: { text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
};

export const ActionDrawer: React.FC = () => {
  const {
    drawerExcId,
    closeDrawer,
    exceptions,
    notifications,
    reviewers,
    finalApprover,
    submitDecision,
    sendNotification,
    addToast,
  } = useApp();

  const [selectedDecision, setSelectedDecision] = useState<ReviewStatus | null>(null);
  const [comment, setComment] = useState('');
  const [recipient, setRecipient] = useState('');
  const [channel, setChannel] = useState<ChannelType>('Teams');
  const [markdownPct, setMarkdownPct] = useState(30);

  const exc = exceptions.find((e) => e.id === drawerExcId);

  useEffect(() => {
    if (exc) {
      setRecipient(exc.reviewer);
      setSelectedDecision(exc.review_status !== 'Pending' ? exc.review_status : null);
      setComment(exc.comment || '');
      if (exc.age_band === 'Terminal') setMarkdownPct(50);
      else if (exc.age_band === 'Aged') setMarkdownPct(30);
      else if (exc.age_band === 'Watch') setMarkdownPct(15);
      else setMarkdownPct(0);
    }
  }, [exc]);

  if (!drawerExcId || !exc) return null;

  const excNotifs = notifications
    .filter((n) => n.exception_id === exc.id)
    .sort((a, b) => new Date(b.sent_time).getTime() - new Date(a.sent_time).getTime());

  const latestNotif = excNotifs[0] || null;

  const fmtMoney = (v: number) => {
    if (v >= 1000000) return '$' + (v / 1000000).toFixed(2) + 'M';
    if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
    return '$' + Math.round(v).toLocaleString();
  };

  const handleDecisionSubmit = async () => {
    if (!selectedDecision) {
      addToast('Please select a decision choice', 'warn');
      return;
    }
    await submitDecision(exc.id, selectedDecision, comment || `Approved via Inspector drawer.`);
    closeDrawer();
  };

  const handleSendNotif = async (escalated = false) => {
    await sendNotification(exc.id, channel, escalated ? finalApprover.name : recipient);
  };

  const bandStyle = BAND_COLORS[exc.age_band] || BAND_COLORS.Healthy;

  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.800"
        backdropFilter="blur(8px)"
        zIndex={300}
        onClick={closeDrawer}
      />

      {/* Glass Slide Drawer */}
      <Box
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        w={{ base: '100%', sm: '560px' }}
        bg="rgba(11, 17, 30, 0.95)"
        backdropFilter="blur(28px)"
        borderLeft="1px solid rgba(255, 255, 255, 0.1)"
        zIndex={310}
        boxShadow="-12px 0 40px rgba(0,0,0,0.6)"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex
          p="14px 18px"
          align="center"
          justify="space-between"
          borderBottom="1px solid rgba(255, 255, 255, 0.08)"
          bg="rgba(14, 23, 38, 0.8)"
        >
          <Box>
            <HStack spacing={2} align="center" mb={0.5}>
              <Badge bg="rgba(6, 182, 212, 0.15)" color="#38BDF8" fontFamily="mono" fontSize="11px" px={2} py={0.5}>
                #{exc.priority_rank} · {exc.sku}
              </Badge>
              <Badge bg={bandStyle.bg} color={bandStyle.text} border={`1px solid ${bandStyle.border}`} fontSize="9.5px">
                {exc.age_band} ({exc.age_days}d)
              </Badge>
            </HStack>
            <Text fontSize="14px" fontWeight="700" color="#F8FAFC" noOfLines={1}>
              {exc.desc}
            </Text>
          </Box>
          <IconButton
            aria-label="Close drawer"
            icon={<X size={16} />}
            size="sm"
            variant="ghost"
            color="#94A3B8"
            onClick={closeDrawer}
          />
        </Flex>

        {/* Scrollable Body */}
        <Box
          p="16px 18px"
          flex={1}
          overflowY="auto"
          sx={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          {/* Key Metrics */}
          <SimpleGrid columns={4} spacing={2.5} mb={4}>
            <Box p="8px 10px" borderRadius="8px" bg="rgba(17, 26, 43, 0.6)" border="1px solid rgba(255, 255, 255, 0.07)">
              <Text fontSize="9px" color="#94A3B8" fontWeight="700">AGE DAYS</Text>
              <Text fontSize="15px" fontWeight="800" color="#F8FAFC" fontFamily="mono">{exc.age_days}d</Text>
            </Box>
            <Box p="8px 10px" borderRadius="8px" bg="rgba(17, 26, 43, 0.6)" border="1px solid rgba(255, 255, 255, 0.07)">
              <Text fontSize="9px" color="#94A3B8" fontWeight="700">UNITS</Text>
              <Text fontSize="15px" fontWeight="800" color="#38BDF8" fontFamily="mono">{exc.units.toLocaleString()}</Text>
            </Box>
            <Box p="8px 10px" borderRadius="8px" bg="rgba(17, 26, 43, 0.6)" border="1px solid rgba(255, 255, 255, 0.07)">
              <Text fontSize="9px" color="#94A3B8" fontWeight="700">UNIT COST</Text>
              <Text fontSize="15px" fontWeight="800" color="#F8FAFC" fontFamily="mono">${exc.unit_cost.toFixed(2)}</Text>
            </Box>
            <Box p="8px 10px" borderRadius="8px" bg="rgba(16, 185, 129, 0.1)" border="1px solid rgba(16, 185, 129, 0.3)">
              <Text fontSize="9px" color="#34D399" fontWeight="700">TOTAL RISK</Text>
              <Text fontSize="15px" fontWeight="800" color="#34D399" fontFamily="mono">{fmtMoney(exc.inv_value)}</Text>
            </Box>
          </SimpleGrid>

          {/* AI Intelligence Card */}
          <Box
            p="12px 14px"
            borderRadius="10px"
            bg="linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.06) 100%)"
            border="1px solid rgba(6, 182, 212, 0.3)"
            mb={4}
          >
            <Flex align="center" gap={1.5} mb={1}>
              <Sparkles size={13} color="#38BDF8" />
              <Text fontSize="10.5px" fontWeight="800" color="#38BDF8" letterSpacing="0.04em" textTransform="uppercase">
                AI Clearance Recommendation
              </Text>
            </Flex>
            <Text fontSize="13px" fontWeight="800" color="#F8FAFC" mb={1}>
              {exc.recommended_action}
            </Text>
            <Text fontSize="11px" color="#94A3B8" lineHeight="1.5">
              "{exc.rationale}"
            </Text>
          </Box>

          {/* Reviewer Decision Workspace */}
          <Box
            p="12px 14px"
            borderRadius="10px"
            bg="rgba(17, 26, 43, 0.7)"
            border="1px solid rgba(255, 255, 255, 0.08)"
            mb={4}
          >
            <Text fontSize="11px" fontWeight="800" color="#F8FAFC" letterSpacing="0.04em" mb={2} textTransform="uppercase">
              Record Decision to Snowflake
            </Text>

            <SimpleGrid columns={4} spacing={2} mb={3}>
              {[
                { status: 'Accepted' as ReviewStatus, label: 'Accept', color: '#34D399', bg: '#059669' },
                { status: 'Modified' as ReviewStatus, label: 'Modify', color: '#FBBF24', bg: '#D97706' },
                { status: 'Rejected' as ReviewStatus, label: 'Reject', color: '#F87171', bg: '#DC2626' },
                { status: 'Pending' as ReviewStatus, label: 'Pending', color: '#38BDF8', bg: '#0284C7' },
              ].map((b) => (
                <Button
                  key={b.status}
                  size="xs"
                  h="30px"
                  bg={selectedDecision === b.status ? b.bg : 'rgba(255, 255, 255, 0.04)'}
                  color={selectedDecision === b.status ? '#070B12' : b.color}
                  border="1px solid"
                  borderColor={selectedDecision === b.status ? b.color : 'rgba(255, 255, 255, 0.1)'}
                  onClick={() => setSelectedDecision(b.status)}
                  fontWeight="700"
                  fontSize="11px"
                >
                  {b.label}
                </Button>
              ))}
            </SimpleGrid>

            <Textarea
              size="xs"
              placeholder="Directive or comment for audit ledger..."
              className="glass-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              mb={3}
            />

            <Button
              size="sm"
              w="100%"
              bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
              color="#070B12"
              fontWeight="800"
              leftIcon={<Database size={13} />}
              isDisabled={!selectedDecision}
              onClick={handleDecisionSubmit}
            >
              Commit Decision
            </Button>
          </Box>

          {/* Teams / Email Dispatch */}
          <Box
            p="12px 14px"
            borderRadius="10px"
            bg="rgba(17, 26, 43, 0.7)"
            border="1px solid rgba(255, 255, 255, 0.08)"
          >
            <Text fontSize="11px" fontWeight="800" color="#F8FAFC" letterSpacing="0.04em" mb={2} textTransform="uppercase">
              Dispatch Notification & SLA
            </Text>

            <SimpleGrid columns={2} spacing={2} mb={2.5}>
              <Select
                size="xs"
                bg="rgba(10, 16, 28, 0.8)"
                borderColor="rgba(255, 255, 255, 0.1)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                {reviewers.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </Select>

              <Select
                size="xs"
                bg="rgba(10, 16, 28, 0.8)"
                borderColor="rgba(255, 255, 255, 0.1)"
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
              >
                <option value="Teams">MS Teams Card</option>
                <option value="Email">Email SMTP</option>
              </Select>
            </SimpleGrid>

            <HStack spacing={2}>
              <Button
                size="xs"
                h="28px"
                flex={1}
                variant="outline"
                borderColor="rgba(6, 182, 212, 0.4)"
                color="#38BDF8"
                leftIcon={<Send size={11} />}
                onClick={() => handleSendNotif(false)}
              >
                Dispatch to {recipient.split(' ')[0]}
              </Button>

              <Button
                size="xs"
                h="28px"
                variant="outline"
                borderColor="rgba(239, 68, 68, 0.4)"
                color="#F87171"
                onClick={() => handleSendNotif(true)}
              >
                Escalate
              </Button>
            </HStack>
          </Box>
        </Box>
      </Box>
    </>
  );
};

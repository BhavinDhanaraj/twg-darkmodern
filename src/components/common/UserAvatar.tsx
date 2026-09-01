import React from 'react';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';

interface UserAvatarProps {
  name: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPresence?: boolean;
  presenceStatus?: 'online' | 'reviewing' | 'away' | 'offline';
  borderGlow?: boolean;
}

// Deterministic gradient palettes for reviewers
const AVATAR_PALETTES: Record<string, { bg: string; text: string; border: string }> = {
  'Reagan Davis': {
    bg: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    text: '#ffffff',
    border: 'rgba(52, 211, 153, 0.4)',
  },
  'Brett Sharman': {
    bg: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
    text: '#ffffff',
    border: 'rgba(56, 189, 248, 0.4)',
  },
  'Priya Nair': {
    bg: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    text: '#ffffff',
    border: 'rgba(167, 139, 250, 0.4)',
  },
  'Mark Thompson': {
    bg: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    text: '#ffffff',
    border: 'rgba(251, 191, 36, 0.4)',
  },
  'Aisha Khan': {
    bg: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    text: '#ffffff',
    border: 'rgba(45, 212, 191, 0.4)',
  },
};

const DEFAULT_PALETTE = {
  bg: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
  text: '#F8FAFC',
  border: 'rgba(148, 163, 184, 0.3)',
};

const PRESENCE_COLORS = {
  online: '#10B981',
  reviewing: '#06B6D4',
  away: '#F59E0B',
  offline: '#64748B',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  role,
  size = 'sm',
  showPresence = true,
  presenceStatus = 'online',
  borderGlow = true,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TW';

  const palette = AVATAR_PALETTES[name] || DEFAULT_PALETTE;

  const sizeMap = {
    xs: { box: '22px', font: '9px', presence: '6px', offset: '-1px' },
    sm: { box: '28px', font: '11px', presence: '7px', offset: '0px' },
    md: { box: '36px', font: '13px', presence: '9px', offset: '0px' },
    lg: { box: '48px', font: '16px', presence: '11px', offset: '1px' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <Box position="relative" display="inline-flex" flexShrink={0}>
      <Flex
        w={currentSize.box}
        h={currentSize.box}
        borderRadius="full"
        bg={palette.bg}
        color={palette.text}
        align="center"
        justify="center"
        fontWeight="700"
        fontSize={currentSize.font}
        letterSpacing="0.02em"
        border="1.5px solid"
        borderColor={borderGlow ? palette.border : 'rgba(255, 255, 255, 0.15)'}
        boxShadow={
          borderGlow
            ? `0 0 10px ${palette.border}, inset 0 1px 1px rgba(255, 255, 255, 0.3)`
            : 'inset 0 1px 1px rgba(255, 255, 255, 0.2)'
        }
        userSelect="none"
      >
        {initials}
      </Flex>
      {showPresence && (
        <Box
          position="absolute"
          bottom={currentSize.offset}
          right={currentSize.offset}
          w={currentSize.presence}
          h={currentSize.presence}
          borderRadius="full"
          bg={PRESENCE_COLORS[presenceStatus]}
          border="1.5px solid #0B0F19"
          boxShadow={`0 0 6px ${PRESENCE_COLORS[presenceStatus]}`}
        />
      )}
    </Box>
  );

  if (role || name) {
    return (
      <Tooltip
        label={`${name}${role ? ` • ${role}` : ''} (${presenceStatus.toUpperCase()})`}
        placement="top"
        hasArrow
      >
        {content}
      </Tooltip>
    );
  }

  return content;
};

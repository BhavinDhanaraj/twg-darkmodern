import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Badge,
} from '@chakra-ui/react';
import { Bot, X, Send, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const CHAT_SUGGESTIONS = [
  'What are the Age Band thresholds?',
  'Can the platform execute automatic markdowns?',
  'How is priority ranking calculated?',
  'What happens to unacknowledged notifications?',
];

export const Chatbot: React.FC = () => {
  const { chatOpen, toggleChat, chatMessages, chatTyping, sendChatMessage } = useApp();
  const [inputVal, setInputVal] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, chatTyping, chatOpen]);

  const handleSend = (text?: string) => {
    const val = text !== undefined ? text : inputVal;
    if (!val.trim()) return;
    sendChatMessage(val);
    if (text === undefined) setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Trigger */}
      <IconButton
        aria-label="Toggle AI Copilot"
        icon={chatOpen ? <X size={20} /> : <Sparkles size={20} />}
        position="fixed"
        bottom="20px"
        right="20px"
        w="48px"
        h="48px"
        borderRadius="full"
        bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
        color="#070B12"
        zIndex={400}
        _hover={{
          transform: 'scale(1.05)',
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.6)',
        }}
        boxShadow="0 0 16px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)"
        onClick={toggleChat}
      />

      {/* Chat Window */}
      {chatOpen && (
        <Box
          position="fixed"
          bottom="80px"
          right="20px"
          w={{ base: 'calc(100vw - 32px)', sm: '400px' }}
          h="520px"
          bg="rgba(11, 17, 30, 0.95)"
          backdropFilter="blur(28px)"
          border="1px solid rgba(16, 185, 129, 0.3)"
          borderRadius="14px"
          boxShadow="0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          display="flex"
          flexDirection="column"
          zIndex={400}
          overflow="hidden"
        >
          {/* Header */}
          <Flex
            p="12px 14px"
            align="center"
            justify="space-between"
            borderBottom="1px solid rgba(255, 255, 255, 0.08)"
            bg="linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)"
          >
            <HStack spacing={2}>
              <Flex
                w="24px"
                h="24px"
                borderRadius="full"
                bg="rgba(16, 185, 129, 0.25)"
                align="center"
                justify="center"
                color="#34D399"
              >
                <Sparkles size={13} />
              </Flex>
              <Box>
                <Text fontWeight="800" fontSize="12.5px" color="#F8FAFC">
                  TWG Exception Copilot
                </Text>
                <Text fontSize="9.5px" color="#94A3B8">
                  SOP BR-001 / BR-006 Intelligence
                </Text>
              </Box>
            </HStack>
            <IconButton
              aria-label="Close chat"
              icon={<X size={14} />}
              size="xs"
              variant="ghost"
              color="#94A3B8"
              onClick={toggleChat}
            />
          </Flex>

          {/* Messages Body */}
          <VStack
            ref={chatBodyRef}
            flex={1}
            p="14px"
            align="stretch"
            spacing={2.5}
            overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)' },
            }}
          >
            {chatMessages.map((m) => {
              if (m.from === 'user') {
                return (
                  <Box
                    key={m.id}
                    alignSelf="flex-end"
                    bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
                    color="#070B12"
                    fontWeight="600"
                    px={3}
                    py={2}
                    borderRadius="10px"
                    borderBottomRightRadius="2px"
                    fontSize="11.5px"
                    maxW="85%"
                    boxShadow="0 2px 10px rgba(16, 185, 129, 0.2)"
                  >
                    {m.text}
                  </Box>
                );
              }
              return (
                <Box
                  key={m.id}
                  alignSelf="flex-start"
                  bg="rgba(17, 26, 43, 0.8)"
                  border="1px solid rgba(255, 255, 255, 0.08)"
                  color="#F8FAFC"
                  px={3.5}
                  py={2.5}
                  borderRadius="10px"
                  borderBottomLeftRadius="2px"
                  fontSize="11.5px"
                  maxW="90%"
                  lineHeight="1.5"
                  boxShadow="0 4px 14px rgba(0, 0, 0, 0.25)"
                >
                  <span dangerouslySetInnerHTML={{ __html: m.text }} />
                  {m.url ? (
                    <Box mt={1.5} fontSize="10.5px" color="#38BDF8">
                      🔍{' '}
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', fontWeight: 600 }}
                      >
                        {m.source} →
                      </a>
                    </Box>
                  ) : m.source ? (
                    <Box mt={1.5} fontSize="9.5px" color="#64748B">
                      Source: {m.source}
                    </Box>
                  ) : null}
                </Box>
              );
            })}
            {chatTyping && (
              <Box
                alignSelf="flex-start"
                bg="rgba(17, 26, 43, 0.8)"
                border="1px solid rgba(255, 255, 255, 0.08)"
                px={3}
                py={1.5}
                borderRadius="8px"
                fontSize="11px"
                color="#94A3B8"
              >
                Thinking...
              </Box>
            )}
          </VStack>

          {/* Prompt Suggestions */}
          <Flex
            px={3}
            py={2}
            gap={1}
            wrap="wrap"
            borderTop="1px solid rgba(255, 255, 255, 0.06)"
            bg="rgba(10, 16, 28, 0.6)"
          >
            {CHAT_SUGGESTIONS.map((s) => (
              <Button
                key={s}
                size="xs"
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.08)"
                color="#94A3B8"
                fontSize="9.5px"
                h="22px"
                px={2}
                _hover={{ bg: 'rgba(255, 255, 255, 0.06)', color: '#38BDF8' }}
                onClick={() => handleSend(s)}
              >
                {s}
              </Button>
            ))}
          </Flex>

          {/* Input Box */}
          <Box p={3} borderTop="1px solid rgba(255, 255, 255, 0.08)" bg="rgba(10, 16, 28, 0.8)">
            <InputGroup size="sm">
              <Input
                placeholder="Ask about SOP rules, thresholds, write-down policies..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                pr="36px"
                className="glass-input"
                fontSize="11.5px"
                borderRadius="6px"
              />
              <InputRightElement width="34px">
                <IconButton
                  aria-label="Send message"
                  icon={<Send size={12} />}
                  size="xs"
                  bg="#10B981"
                  color="#070B12"
                  _hover={{ bg: '#34D399' }}
                  onClick={() => handleSend()}
                />
              </InputRightElement>
            </InputGroup>
          </Box>
        </Box>
      )}
    </>
  );
};

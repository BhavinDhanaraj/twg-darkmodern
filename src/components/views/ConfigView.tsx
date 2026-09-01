import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OperatingModel } from '../../types';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  SlidersHorizontal,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
  Database,
  Info,
} from 'lucide-react';

interface ModelThresholdConfig {
  watch: number;
  aged: number;
  terminal: number;
  description: string;
  defaultLead: string;
}

const DEFAULT_THRESHOLDS: Record<OperatingModel, ModelThresholdConfig> = {
  'Continuity Core': {
    watch: 90,
    aged: 180,
    terminal: 360,
    description: 'Year-round evergreen lines with high replenishment frequency.',
    defaultLead: 'Reagan Davis',
  },
  'Replen Tail': {
    watch: 180,
    aged: 360,
    terminal: 540,
    description: 'Extended replenishment cycle items with lower baseline velocity.',
    defaultLead: 'Brett Sharman',
  },
  'Seasonal & Promo': {
    watch: 60,
    aged: 120,
    terminal: 240,
    description: 'Time-bound event merchandise requiring aggressive clearance.',
    defaultLead: 'Mark Thompson',
  },
  'Indent & Special': {
    watch: 120,
    aged: 240,
    terminal: 450,
    description: 'Direct-order and specialist non-core lines with long lead times.',
    defaultLead: 'Priya Nair',
  },
};

export const ConfigView: React.FC = () => {
  const { exceptions, addToast } = useApp();
  const [thresholds, setThresholds] = useState<Record<OperatingModel, ModelThresholdConfig>>(DEFAULT_THRESHOLDS);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateThreshold = (
    model: OperatingModel,
    field: 'watch' | 'aged' | 'terminal',
    value: number
  ) => {
    setThresholds((prev) => ({
      ...prev,
      [model]: {
        ...prev[model],
        [field]: value,
      },
    }));
  };

  const handleResetDefaults = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    addToast('Reset policy thresholds to SOP standards', 'warn');
  };

  const handleSaveToSnowflake = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    addToast('Committed updated Ageing Policies to Snowflake Rule Engine', 'success');
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
          <HStack spacing={2}>
            <SlidersHorizontal size={16} color="#34D399" />
            <Text fontSize="13px" fontWeight="800" letterSpacing="0.02em" color="#F8FAFC">
              STOCK AGEING POLICY MATRIX (BR-001)
            </Text>
            <Badge bg="rgba(16, 185, 129, 0.15)" color="#34D399" fontSize="9px" px={1.5} borderRadius="3px">
              SNOWFLAKE ACTIVE
            </Badge>
          </HStack>

          <HStack spacing={2}>
            <Button
              size="xs"
              h="28px"
              px={2.5}
              variant="outline"
              borderColor="rgba(255, 255, 255, 0.12)"
              color="#94A3B8"
              leftIcon={<RotateCcw size={12} />}
              onClick={handleResetDefaults}
            >
              Reset SOP Defaults
            </Button>

            <Button
              size="xs"
              h="28px"
              px={3.5}
              bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
              color="#070B12"
              fontWeight="700"
              leftIcon={<Database size={13} />}
              isLoading={isSaving}
              onClick={handleSaveToSnowflake}
            >
              Commit Policies
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Grid of Operating Models */}
      <Box
        flex={1}
        className="glass-panel"
        borderRadius="12px"
        p={4}
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' },
        }}
      >
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {(Object.keys(thresholds) as OperatingModel[]).map((om) => {
            const config = thresholds[om];
            const skusInModel = exceptions.filter((e) => e.operating_model === om);
            const terminalCount = skusInModel.filter((e) => e.age_days >= config.terminal).length;
            const agedCount = skusInModel.filter((e) => e.age_days >= config.aged && e.age_days < config.terminal).length;
            const watchCount = skusInModel.filter((e) => e.age_days >= config.watch && e.age_days < config.aged).length;
            const healthyCount = skusInModel.filter((e) => e.age_days < config.watch).length;

            return (
              <Box
                key={om}
                p="16px 18px"
                borderRadius="10px"
                bg="rgba(17, 26, 43, 0.75)"
                border="1px solid rgba(255, 255, 255, 0.08)"
                boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.25)"
              >
                {/* Header */}
                <Flex align="center" justify="space-between" mb={2}>
                  <Box>
                    <HStack spacing={2}>
                      <Text fontSize="14px" fontWeight="800" color="#F8FAFC">
                        {om}
                      </Text>
                      <Badge bg="rgba(6, 182, 212, 0.15)" color="#38BDF8" fontSize="9px">
                        {skusInModel.length} SKUs
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="#94A3B8" mt={0.5}>
                      {config.description}
                    </Text>
                  </Box>

                  <Badge bg="rgba(255, 255, 255, 0.06)" color="#94A3B8" fontSize="10px">
                    Lead: {config.defaultLead}
                  </Badge>
                </Flex>

                <Divider borderColor="rgba(255, 255, 255, 0.06)" my={3} />

                {/* Sliders for Watch, Aged, Terminal */}
                <VStack align="stretch" spacing={3} mb={4}>
                  {/* Watch Threshold */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <HStack spacing={1.5}>
                        <Box w="6px" h="6px" borderRadius="full" bg="#FBBF24" />
                        <Text fontSize="11px" fontWeight="700" color="#FBBF24">
                          Watch Age Band
                        </Text>
                      </HStack>
                      <Badge bg="rgba(245, 158, 11, 0.15)" color="#FBBF24" fontFamily="mono" fontSize="10px">
                        {config.watch} Days
                      </Badge>
                    </Flex>
                    <Slider
                      aria-label="watch-slider"
                      value={config.watch}
                      min={30}
                      max={360}
                      step={15}
                      onChange={(v) => handleUpdateThreshold(om, 'watch', v)}
                    >
                      <SliderTrack bg="rgba(255, 255, 255, 0.1)" h="5px">
                        <SliderFilledTrack bg="#FBBF24" />
                      </SliderTrack>
                      <SliderThumb boxSize="14px" bg="#FBBF24" />
                    </Slider>
                  </Box>

                  {/* Aged Threshold */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <HStack spacing={1.5}>
                        <Box w="6px" h="6px" borderRadius="full" bg="#FB7185" />
                        <Text fontSize="11px" fontWeight="700" color="#FB7185">
                          Aged Age Band
                        </Text>
                      </HStack>
                      <Badge bg="rgba(244, 63, 94, 0.15)" color="#FB7185" fontFamily="mono" fontSize="10px">
                        {config.aged} Days
                      </Badge>
                    </Flex>
                    <Slider
                      aria-label="aged-slider"
                      value={config.aged}
                      min={config.watch}
                      max={540}
                      step={15}
                      onChange={(v) => handleUpdateThreshold(om, 'aged', v)}
                    >
                      <SliderTrack bg="rgba(255, 255, 255, 0.1)" h="5px">
                        <SliderFilledTrack bg="#FB7185" />
                      </SliderTrack>
                      <SliderThumb boxSize="14px" bg="#FB7185" />
                    </Slider>
                  </Box>

                  {/* Terminal Threshold */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <HStack spacing={1.5}>
                        <Box w="6px" h="6px" borderRadius="full" bg="#F87171" />
                        <Text fontSize="11px" fontWeight="700" color="#F87171">
                          Terminal Risk Threshold (Write-Down Trigger)
                        </Text>
                      </HStack>
                      <Badge bg="rgba(239, 68, 68, 0.15)" color="#F87171" fontFamily="mono" fontSize="10px">
                        {config.terminal} Days
                      </Badge>
                    </Flex>
                    <Slider
                      aria-label="terminal-slider"
                      value={config.terminal}
                      min={config.aged}
                      max={720}
                      step={30}
                      onChange={(v) => handleUpdateThreshold(om, 'terminal', v)}
                    >
                      <SliderTrack bg="rgba(255, 255, 255, 0.1)" h="5px">
                        <SliderFilledTrack bg="#F87171" />
                      </SliderTrack>
                      <SliderThumb boxSize="14px" bg="#F87171" />
                    </Slider>
                  </Box>
                </VStack>

                {/* Live Catalogue Impact Simulator */}
                <Box
                  p="8px 12px"
                  borderRadius="8px"
                  bg="rgba(10, 16, 28, 0.65)"
                  border="1px solid rgba(255, 255, 255, 0.06)"
                >
                  <Text fontSize="9.5px" fontWeight="700" color="#94A3B8" letterSpacing="0.04em" mb={1.5} textTransform="uppercase">
                    Catalogue Impact Simulator
                  </Text>
                  <SimpleGrid columns={4} spacing={2} textAlign="center">
                    <Box>
                      <Text fontSize="8.5px" color="#34D399">Healthy (&lt;{config.watch}d)</Text>
                      <Text fontSize="12px" fontWeight="800" color="#F8FAFC" fontFamily="mono">{healthyCount}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="8.5px" color="#FBBF24">Watch ({config.watch}-{config.aged}d)</Text>
                      <Text fontSize="12px" fontWeight="800" color="#FBBF24" fontFamily="mono">{watchCount}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="8.5px" color="#FB7185">Aged ({config.aged}-{config.terminal}d)</Text>
                      <Text fontSize="12px" fontWeight="800" color="#FB7185" fontFamily="mono">{agedCount}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="8.5px" color="#F87171">Terminal (&gt;{config.terminal}d)</Text>
                      <Text fontSize="12px" fontWeight="800" color="#F87171" fontFamily="mono">{terminalCount}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    </Flex>
  );
};

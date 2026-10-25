import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors, radii, typography } from '@southcolours/theme';

interface OfferCategoryCircleProps {
  size?: number;
}

// 8 blinking fairy lights around the circular border
const LIGHT_DOTS = [
  { angle: 0, color: '#FF4081', group: 0 },   // East - Primary Pink
  { angle: 45, color: '#FFB300', group: 1 },  // SE - Festive Gold
  { angle: 90, color: '#E91E63', group: 0 },  // South - Deep Pink
  { angle: 135, color: '#FFD54F', group: 1 }, // SW - Warm Gold
  { angle: 180, color: '#FF4081', group: 0 }, // West - Primary Pink
  { angle: 225, color: '#FFB300', group: 1 }, // NW - Festive Gold
  { angle: 270, color: '#E91E63', group: 0 }, // North - Deep Pink
  { angle: 315, color: '#FFD54F', group: 1 }, // NE - Warm Gold
];

export const OfferDressSvgIcon = ({ size = 36 }: { size?: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        {/* Dress Gradient in App Theme Pink & Magenta */}
        <LinearGradient id="dressGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FF4081" />
          <Stop offset="50%" stopColor="#E91E63" />
          <Stop offset="100%" stopColor="#C2185B" />
        </LinearGradient>

        {/* Festive Gold Gradient for Belt & Hem */}
        <LinearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFF176" />
          <Stop offset="50%" stopColor="#FFD54F" />
          <Stop offset="100%" stopColor="#FFA000" />
        </LinearGradient>

        {/* Offer Tag Gradient */}
        <LinearGradient id="tagGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFE082" />
          <Stop offset="100%" stopColor="#FF8F00" />
        </LinearGradient>
      </Defs>

      {/* Twinkling Sparkles */}
      <Path
        d="M38 5 L39.2 8.8 L43 10 L39.2 11.2 L38 15 L36.8 11.2 L33 10 L36.8 8.8 Z"
        fill="#FFD54F"
      />
      <Path
        d="M10 8 L10.8 10.4 L13 11 L10.8 11.6 L10 14 L9.2 11.6 L7 11 L9.2 10.4 Z"
        fill="#FF80AB"
      />

      {/* Dress Bodice */}
      <Path
        d="M17 11 C18.5 13 25.5 13 27 11 L29.5 14 C29.5 14 28 19.5 26.5 20.5 L17.5 20.5 C16 19.5 14.5 14 14.5 14 Z"
        fill="url(#dressGradient)"
      />

      {/* Capped Sleeves */}
      <Path
        d="M17 11 C14 11 12.5 13 14.5 14.5 L15 13.5 Z"
        fill="#C2185B"
      />
      <Path
        d="M27 11 C30 11 31.5 13 29.5 14.5 L29 13.5 Z"
        fill="#C2185B"
      />

      {/* Flared Tiered Dress Skirt */}
      <Path
        d="M17.5 20.5 L26.5 20.5 C28.5 24.5 33.5 31.5 35.5 35.5 C32.5 37.5 29.5 36.5 26.5 37.5 C23.5 36.5 20.5 37.5 17.5 37.5 C14.5 36.5 11.5 37.5 8.5 35.5 C10.5 31.5 15.5 24.5 17.5 20.5 Z"
        fill="url(#dressGradient)"
      />

      {/* Tier fold line */}
      <Path
        d="M13 28 C17 30 27 30 31 28"
        stroke="#FF80AB"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom Golden Scallop Hem */}
      <Path
        d="M8.5 35.5 C11.5 37 14.5 36 17.5 37 C20.5 36 23.5 37 26.5 36 C29.5 37 32.5 36 35.5 35.5"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Golden Waistband Sash */}
      <Rect
        x="16.5"
        y="19.5"
        width="11"
        height="2.5"
        rx="1"
        fill="url(#goldGradient)"
      />
      {/* Belt Jewel */}
      <Circle cx="22" cy="20.75" r="1.2" fill="#FFFFFF" />

      {/* Hanging Discount Offer Tag */}
      <G transform="translate(25.5, 20.5) rotate(16)">
        {/* String */}
        <Path d="M0 0 L4.5 2.5" stroke="#FFE082" strokeWidth="1" strokeLinecap="round" />
        {/* Tag Body */}
        <Path
          d="M4.5 0.5 L12.5 -2.5 C14 -3 15.5 -2 16 -0.5 L17.5 7 C18 8.5 17 10 15.5 10.5 L7.5 13.5 C6 14 4.5 13 4 11.5 L2.5 4 C2 2.5 3 1 4.5 0.5 Z"
          fill="url(#tagGradient)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
        {/* Punch Hole */}
        <Circle cx="5.5" cy="3" r="0.9" fill="#FFFFFF" />
        {/* % Symbol inside Tag */}
        <SvgText
          x="10.5"
          y="8"
          fontSize="6.5"
          fontWeight="bold"
          fill="#880E4F"
          fontFamily="System"
          textAnchor="middle"
        >
          %
        </SvgText>
      </G>
    </Svg>
  );
};

export default function OfferCategoryCircle({ size = 64 }: OfferCategoryCircleProps) {
  // Animated value for color cycling border: 0 -> 1 -> 2 -> 3 -> 0
  const colorAnim = useRef(new Animated.Value(0)).current;
  // Animated value for pulsating glow halo
  const pulseAnim = useRef(new Animated.Value(0)).current;
  // Animated value for alternating blinking lights
  const lightsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous smooth border color shifting loop
    const colorLoop = Animated.loop(
      Animated.timing(colorAnim, {
        toValue: 4,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    // 2. Breathing glow pulse loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    // 3. Rhythmic blinking lights loop (fairy lights effect)
    const lightsLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(lightsAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(lightsAnim, {
          toValue: 0,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );

    colorLoop.start();
    pulseLoop.start();
    lightsLoop.start();

    return () => {
      colorLoop.stop();
      pulseLoop.stop();
      lightsLoop.stop();
    };
  }, [colorAnim, pulseAnim, lightsAnim]);

  // Border color transitions through signature app theme colors:
  // Primary Pink -> Festive Golden Amber -> Deep Pink/Magenta -> Bright Rose -> Primary Pink
  const animatedBorderColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      colors.primary,      // #FF4081
      '#FFB300',           // Festive Gold
      colors.primaryDeep,  // #E91E63
      '#FF80AB',           // Bright Rose
      colors.primary,      // #FF4081
    ],
  });

  // Animated halo shadow opacity & radius
  const haloOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.65],
  });

  const haloScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.07],
  });

  // Group 0 lights: scale 0.8 -> 1.35, opacity 0.35 -> 1.0
  const group0Scale = lightsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.35],
  });
  const group0Opacity = lightsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1.0],
  });

  // Group 1 lights: opposite phase (1.35 -> 0.8, 1.0 -> 0.35)
  const group1Scale = lightsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.35, 0.8],
  });
  const group1Opacity = lightsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 0.35],
  });

  const radius = (size / 2) - 2.5; // Sitting right along border perimeter
  const center = size / 2;
  const dotSize = 4.8;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]} pointerEvents="none">
      {/* 1. Pulsing Ambient Glow Background Layer */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: animatedBorderColor,
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />

      {/* 2. Inner Circle with Soft Blush Background & Animated Border */}
      <Animated.View
        style={[
          styles.innerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: animatedBorderColor,
          },
        ]}
      >
        {/* Custom Vector Offer Dresses Icon */}
        <OfferDressSvgIcon size={size * 0.58} />

        {/* Mini "OFFER" ribbon pill at bottom center */}
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>OFFER</Text>
        </View>
      </Animated.View>

      {/* 3. Blinking Fairy Lights along the Circular Border */}
      {LIGHT_DOTS.map((dot, index) => {
        const rad = (dot.angle * Math.PI) / 180;
        const x = center + radius * Math.cos(rad) - (dotSize / 2);
        const y = center + radius * Math.sin(rad) - (dotSize / 2);

        const isGroup0 = dot.group === 0;
        const dotScale = isGroup0 ? group0Scale : group1Scale;
        const dotOpacity = isGroup0 ? group0Opacity : group1Opacity;

        return (
          <Animated.View
            key={`light-${index}`}
            style={[
              styles.lightDot,
              {
                left: x,
                top: y,
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dot.color,
                opacity: dotOpacity,
                transform: [{ scale: dotScale }],
                shadowColor: dot.color,
              },
            ]}
          >
            {/* White bright center sparkle inside each bulb */}
            <View style={styles.lightBulbCore} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  ambientGlow: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        shadowOpacity: 0.6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  innerCircle: {
    backgroundColor: '#FFF5F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.2,
    position: 'relative',
    overflow: 'visible',
  },
  offerBadge: {
    position: 'absolute',
    bottom: -3,
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.white,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 3,
  },
  offerBadgeText: {
    color: colors.white,
    fontSize: 7.5,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  lightDot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 3,
    shadowOpacity: 0.9,
    elevation: 4,
  },
  lightBulbCore: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
});

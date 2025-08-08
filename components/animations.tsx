import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

export type AnimationProps = {
  children: React.ReactNode;
  delay?: number; // ms
  duration?: number; // ms
  style?: ViewStyle | ViewStyle[];
};

export function FadeSlideIn({ children, delay = 0, duration = 400, style }: AnimationProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function ScaleIn({ children, delay = 0, duration = 350, style }: AnimationProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 80 }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay, duration, opacity, scale]);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

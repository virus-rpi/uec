import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, TextProps } from "react-native";

type Props = TextProps & {
  text: string;
  speedMsPerChar?: number; // typing speed
  startDelayMs?: number; // delay before start
  cursor?: string; // e.g., "|" or "▌"
  loop?: boolean;
  pauseAtEndMs?: number; // how long to keep blinking after complete before hiding cursor
};

export default function TypewriterText({
  text,
  speedMsPerChar = 30,
  startDelayMs = 0,
  cursor = "▌",
  loop = false,
  pauseAtEndMs = 900,
  style,
  ...rest
}: Props) {
  const [index, setIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopCursorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completed = index >= text.length;
  const visible = useMemo(() => text.slice(0, index), [text, index]);

  useEffect(() => {
    setIndex(0);
    setShowCursor(true);
    setIsBlinking(false);

    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    if (stopCursorTimeoutRef.current) clearTimeout(stopCursorTimeoutRef.current);

    startTimeoutRef.current = setTimeout(() => {
      setIsBlinking(true);
      blinkIntervalRef.current = setInterval(() => {
        setShowCursor((s) => !s);
      }, 500);

      typingIntervalRef.current = setInterval(() => {
        setIndex((i) => {
          const next = i + 1;
          if (next > text.length) {
            if (loop) {
              return 0;
            }
            return i;
          }
          return next;
        });
      }, Math.max(1, speedMsPerChar));
    }, Math.max(0, startDelayMs));

    return () => {
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      if (stopCursorTimeoutRef.current) clearTimeout(stopCursorTimeoutRef.current);
    };
  }, [text, speedMsPerChar, startDelayMs, loop]);

  useEffect(() => {
    if (!loop && completed) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (stopCursorTimeoutRef.current) clearTimeout(stopCursorTimeoutRef.current);
      stopCursorTimeoutRef.current = setTimeout(() => {
        if (blinkIntervalRef.current) {
          clearInterval(blinkIntervalRef.current);
          blinkIntervalRef.current = null;
        }
        setIsBlinking(false);
        setShowCursor(false);
      }, Math.max(0, pauseAtEndMs));
    }
  }, [completed, loop, pauseAtEndMs]);

  return (
    <Text style={[style]} {...rest}>
      <Text
        style={[style]}
      >
        {visible}
        {(isBlinking && showCursor) || (!completed && showCursor) ? cursor : ""}
      </Text>
      <Text style={[style, { opacity: 0 }]}>{cursor}</Text>
    </Text>
  );
}

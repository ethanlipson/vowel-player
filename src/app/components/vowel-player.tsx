"use client";

import { Button, Group, rem, Stack, Text } from "@mantine/core";
import { useMove } from "@mantine/hooks";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { Fragment, useEffect, useRef, useState } from "react";

type VoiceApparatus = {
  ctx: AudioContext;
  gainNode: GainNode;
  oscillator: OscillatorNode;
  lowpass: BiquadFilterNode;
  cutNode: BiquadFilterNode;
  f1Node: BiquadFilterNode;
  f2Node: BiquadFilterNode;
};

type Formant = {
  min: number;
  max: number;
  q: number;
  gain: number;
};

const settings = {
  f1: {
    min: 200,
    max: 1000,
    q: 1,
    gain: 16,
    default: 500,
  },
  f2: {
    min: 500,
    max: 3000,
    q: 10,
    gain: 15,
    default: 1000,
  },
} as const;

const vowels = [
  [80, 20, "i"],
  [180, 17.5, "y"],
  [140, 95, "e"],
  [220, 85, "ø"],
  [220, 205, "ɛ"],
  [258, 192.5, "œ"],
  [320, 360, "a"],
  [194, 291, "æ"],
  [412, 275, "ɑ"],
  [448, 250, "ɒ"],
  [366, 200, "ʌ"],
  [460, 150, "ɔ"],
  [338, 130, "ɤ"],
  [472, 80, "o"],
  [340, 50, "ɯ"],
  [481, 25, "u"],
] as const;

export default function VowelPlayer() {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({
    x: 1 - formantToPos(settings.f2.default, settings.f2),
    y: formantToPos(settings.f1.default, settings.f1),
  });
  const { ref, active } = useMove(setPos);
  const voiceApparatus = useRef<VoiceApparatus | null>(null);

  function posToFormant(prog: number, settings: Formant) {
    return settings.min + (settings.max - settings.min) * prog;
  }

  function formantToPos(formant: number, settings: Formant) {
    return (formant - settings.min) / (settings.max - settings.min);
  }

  function createChain() {
    const ctx = voiceApparatus.current?.ctx ?? new AudioContext();

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);

    const oscillator = ctx.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(110, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.Q.setValueAtTime(0, ctx.currentTime);
    lowpass.frequency.setValueAtTime(12740, ctx.currentTime);

    const cutNode = ctx.createBiquadFilter();
    cutNode.type = "peaking";
    cutNode.Q.setValueAtTime(0.53, ctx.currentTime);
    cutNode.gain.setValueAtTime(-18, ctx.currentTime);
    cutNode.frequency.setValueAtTime(3150, ctx.currentTime);

    const f1Node = ctx.createBiquadFilter();
    f1Node.type = "peaking";
    f1Node.Q.setValueAtTime(settings.f1.q, ctx.currentTime);
    f1Node.gain.setValueAtTime(settings.f1.gain, ctx.currentTime);
    f1Node.frequency.setValueAtTime(
      posToFormant(pos.y, settings.f1),
      ctx.currentTime
    );

    const f2Node = ctx.createBiquadFilter();
    f2Node.type = "peaking";
    f2Node.Q.setValueAtTime(settings.f2.q, ctx.currentTime);
    f2Node.gain.setValueAtTime(settings.f2.gain, ctx.currentTime);
    f2Node.frequency.setValueAtTime(
      posToFormant(1 - pos.x, settings.f2),
      ctx.currentTime
    );

    oscillator
      .connect(gainNode)
      .connect(lowpass)
      .connect(cutNode)
      .connect(f1Node)
      .connect(f2Node)
      .connect(ctx.destination);

    voiceApparatus.current = {
      ctx,
      gainNode,
      oscillator,
      lowpass,
      cutNode,
      f1Node,
      f2Node,
    };
  }

  useEffect(() => {
    if (!voiceApparatus.current) return;

    voiceApparatus.current.f1Node.frequency.setValueAtTime(
      posToFormant(pos.y, settings.f1),
      voiceApparatus.current.ctx.currentTime
    );

    voiceApparatus.current.f2Node.frequency.setValueAtTime(
      posToFormant(1 - pos.x, settings.f2),
      voiceApparatus.current.ctx.currentTime
    );
  }, [pos]);

  return (
    <Stack align="flex-start" style={{ flexBasis: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
        <Group justify="space-between">
          <Text size="xs">3000</Text>
          <Text fw={700}>F2</Text>
          <Text size="xs">500</Text>
        </Group>
        <div />
        <div
          ref={ref}
          style={{
            width: `min(${rem(400)}, 80vw)`,
            aspectRatio: "522 / 422",
            backgroundColor: "var(--mantine-color-blue-light)",
            position: "relative",
            touchAction: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `calc(${pos.x * 100}% - ${rem(8)})`,
              top: `calc(${pos.y * 100}% - ${rem(8)})`,
              width: rem(16),
              height: rem(16),
              backgroundColor: active
                ? "var(--mantine-color-teal-7)"
                : "var(--mantine-color-blue-7)",
            }}
          />
          <svg width="100%" viewBox="0 0 522 422">
            {vowels.map((v, i) => (
              <Fragment key={i}>
                <circle cx={v[0]} cy={v[1]} r={1} />
                <text x={v[0] - 10} y={v[1] + 10}>
                  {v[2]}
                </text>
              </Fragment>
            ))}
          </svg>
        </div>
        <Stack justify="space-between" align="center">
          <Text size="xs">200</Text>
          <Text fw={700}>F1</Text>
          <Text size="xs">1000</Text>
        </Stack>
      </div>
      <Stack gap={0}>
        <Text>F1: {Math.round(posToFormant(pos.y, settings.f1))}</Text>
        <Text>F2: {Math.round(posToFormant(1 - pos.x, settings.f2))}</Text>
      </Stack>
      <Button
        leftSection={
          playing ? (
            <IconPlayerPauseFilled size={14} />
          ) : (
            <IconPlayerPlayFilled size={14} />
          )
        }
        onClick={() => {
          if (playing) {
            voiceApparatus.current?.oscillator.stop();
            voiceApparatus.current?.oscillator.disconnect();
            setPlaying(false);
          } else {
            createChain();
            voiceApparatus.current?.oscillator.start();
            setPlaying(true);
          }
        }}
      >
        <Text>{playing ? "Stop" : "Start"}</Text>
      </Button>
    </Stack>
  );
}

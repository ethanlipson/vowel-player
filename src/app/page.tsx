"use client";

import { Button, Group, rem, Stack, Text } from "@mantine/core";
import { useMove } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

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

export default function Home() {
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
    <Stack align="flex-start" p={rem(32)}>
      <Stack gap={0}>
        <Group justify="space-between" mr={rem(44)}>
          <Text>3000</Text>
          <Text>500</Text>
        </Group>
        <Group gap={8}>
          <div
            ref={ref}
            style={{
              width: rem(400),
              height: rem((422 / 522) * 400),
              backgroundColor: "var(--mantine-color-blue-light)",
              position: "relative",
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
            <svg width={rem(522 / 16)} viewBox="0 0 522 422">
              <circle id="circle_0" cx="80" cy="20" r="1"></circle>
              <text id="text_0" x="70" y="30">
                i
              </text>
              <circle id="circle_1" cx="180" cy="17.5" r="1"></circle>
              <text id="text_1" x="170" y="27.5">
                y
              </text>
              <circle id="circle_2" cx="140" cy="95" r="1"></circle>
              <text id="text_2" x="130" y="105">
                e
              </text>
              <circle id="circle_3" cx="220" cy="85" r="1"></circle>
              <text id="text_3" x="210" y="95">
                ø
              </text>
              <circle id="circle_4" cx="220" cy="205" r="1"></circle>
              <text id="text_4" x="210" y="215">
                ɛ
              </text>
              <circle id="circle_5" cx="258" cy="192.5" r="1"></circle>
              <text id="text_5" x="248" y="202.5">
                œ
              </text>
              <circle id="circle_6" cx="320" cy="360" r="1"></circle>
              <text id="text_6" x="310" y="370">
                a
              </text>
              <circle id="circle_7" cx="194" cy="291" r="1"></circle>
              <text id="text_7" x="184" y="301">
                æ
              </text>
              <circle id="circle_8" cx="412" cy="275" r="1"></circle>
              <text id="text_8" x="402" y="285">
                ɑ
              </text>
              <circle id="circle_9" cx="448" cy="250" r="1"></circle>
              <text id="text_9" x="438" y="260">
                ɒ
              </text>
              <circle id="circle_10" cx="366" cy="200" r="1"></circle>
              <text id="text_10" x="356" y="210">
                ʌ
              </text>
              <circle id="circle_11" cx="460" cy="150" r="1"></circle>
              <text id="text_11" x="450" y="160">
                ɔ
              </text>
              <circle id="circle_12" cx="338" cy="130" r="1"></circle>
              <text id="text_12" x="328" y="140">
                ɤ
              </text>
              <circle id="circle_13" cx="472" cy="80" r="1"></circle>
              <text id="text_13" x="462" y="90">
                o
              </text>
              <circle id="circle_14" cx="340" cy="50" r="1"></circle>
              <text id="text_14" x="330" y="60">
                ɯ
              </text>
              <circle id="circle_15" cx="481" cy="25" r="1"></circle>
              <text id="text_15" x="471" y="35">
                u
              </text>
            </svg>
          </div>
          <Stack justify="space-between" h={rem((422 / 522) * 400)}>
            <Text>200</Text>
            <Text>1000</Text>
          </Stack>
        </Group>
      </Stack>
      <Button
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
        {playing ? "Stop" : "Start"}
      </Button>
    </Stack>
  );
}

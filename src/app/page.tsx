import { Anchor, Group, rem, Stack, Text, Title } from "@mantine/core";
import VowelPlayer from "./components/vowel-player";
import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const viewport = headersList.get("x-viewport");

  return (
    <Group justify="space-between" align="start" p={rem(32)} gap={rem(64)}>
      <Stack style={{ flexBasis: 0, flexGrow: 1 }}>
        <Title>Vowel Player</Title>
        <Text>
          <Anchor href="https://ethanlipson.com">Ethan Lipson</Anchor> and{" "}
          <Anchor href="https://github.com/yrafalin">Yoav Rafalin</Anchor>
        </Text>
        <Text>
          This was created as a part of our investigation into so-called{" "}
          <i>hypervowels</i>, those which in principle exist but cannot be
          created by the human mouth due to biological constraints.
        </Text>
        <Text>
          <Anchor href="https://github.com/ethanlipson/vowel-player">
            GitHub
          </Anchor>
        </Text>
      </Stack>
      <VowelPlayer />
      <Stack style={{ textAlign: "right", flexBasis: 0, flexGrow: 1 }}>
        <Title order={3}>Controls</Title>
        <Stack gap={0}>
          <Text>Press the start/stop button to toggle sound</Text>
          <Text>Drag the cursor to change the vowel</Text>
          {viewport === "mobile" && (
            <Text c="red">
              Note: if you&apos;re on mobile, you might need to take your phone
              off silent
            </Text>
          )}
        </Stack>
        <Title order={3}>Credits</Title>
        <Text>
          Thanks to{" "}
          <Anchor href="https://lakiryt.com/vowel-chart/?lang=en">
            Taro Yoshioka
          </Anchor>{" "}
          for the audio configuration and placement of vowels
        </Text>
      </Stack>
    </Group>
  );
}

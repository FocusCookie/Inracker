import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import PlayerCard from "./PlayerCard";

const meta = {
  title: "Components/PlayerCard",
  component: PlayerCard,
  parameters: {},
  args: {
    onSelect: fn(),
    expanded: false,
    selected: false,
    player: {
      id: 1,
      armor: 12,
      role: "mage",
      classSg: 22,
      details: "Hex hex!",
      effects: [],
      icon: "🧙",
      attributes: {
        charisma: 10,
        constitution: 10,
        dexterity: 10,
        id: 10,
        intelligence: 10,
        player: 10,
        strength: 10,
        wisdom: 10,
      },
      ep: 234,
      health: 23,
      maxHealth: 30,
      level: 4,
      skills: {
        acrobatics: 2,
        arcane: 2,
        athletics: 2,
        craftmanship: 2,
        custom_1: 2,
        custom_2: 2,
        deception: 2,
        diplomacy: 2,
        healing: 2,
        id: 2,
        intimidation: 2,
        nature: 2,
        occultism: 2,
        performance: 2,
        player: 2,
        religion: 2,
        social: 2,
        stealth: 2,
        survival: 2,
        thievery: 2,
      },
      immunities: [],
      movement: {
        air: 0,
        ground: 8,
        highJump: 2,
        water: 2,
        wideJump: 4,
      },
      name: "H. Potter",
      resistances: [
        {
          id: 1,
          name: "resistance xyz",
          icon: "🚨",
          description: "# Resistance markdown",
        },
      ],
      perception: 22,
      savingThrows: {
        reflex: 2,
        toughness: 2,
        will: 2,
      },
      shield: null,
    },
  },
  decorators: [(Story) => <div className="w-fit bg-white p-4">{Story()}</div>],
} satisfies Meta<typeof PlayerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};

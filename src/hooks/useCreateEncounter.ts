import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const useCreateEncounter = () => {
  const RollSchema = z.object({
    passed: z.boolean(),
    type: z.literal("roll"),
    name: z.string().min(2),
    icon: z.string().emoji(),
    description: z.string(),
    experience: z.number(),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    element: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    //    images: z.array(z.instanceof(File).or(z.string())),
    dice: z.number().min(2).max(100),
    skill: z.string().min(2),
    difficulties: z.array(
      z.object({
        value: z.number().min(1).max(100),
        description: z.string().min(2),
      }),
    ),
  });

  const FightSchema = z.object({
    passed: z.boolean(),
    type: z.literal("fight"),
    name: z.string().min(2),
    icon: z.string().emoji(),
    description: z.string(),
    experience: z.number(),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    element: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    //    images: z.array(z.instanceof(File).or(z.string())),
    opponents: z.array(z.number()).min(1),
  });

  const NoteSchema = z.object({
    passed: z.boolean(),
    type: z.literal("note"),
    name: z.string().min(2),
    icon: z.string().emoji(),
    description: z.string(),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    element: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    //    images: z.array(z.instanceof(File).or(z.string())),
  });

  const schemas = [
    RollSchema,
    FightSchema,
    NoteSchema,
  ] as const satisfies readonly [
    typeof RollSchema,
    typeof FightSchema,
    typeof NoteSchema,
  ];

  const schema = z.discriminatedUnion("type", schemas);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      passed: false,
      element: {
        height: 100,
        width: 100,
        x: 0,
        y: 0,
      },
      icon: "📝",
      name: "",
      type: "roll",
      description: "",
      experience: 10,
      color: "#ffffff",
      skill: "Perception",
      dice: 20,
      difficulties: [
        { value: 10, description: "crit fail" },
        { value: 15, description: "pass" },
        { value: 20, description: "crit success" },
      ],
      //@ts-ignore
      opponents: [],
    },
  });

  return { form, schema };
};

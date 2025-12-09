import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createEncounterSchema,
  TCreateEncounter,
} from "@/schemas/createEncounter";

export function useCreateEncounter() {
  const form = useForm<TCreateEncounter>({
    resolver: zodResolver(createEncounterSchema),
    defaultValues: {
      name: "",
      description: "",
      experience: 0,
      icon: "📝",
      color: "#ffffff",
      dice: 20,
      difficulties: [],
      element: null,
      images: [],
      opponents: [],
      passed: false,
      completed: false,
      skill: "",
      type: "note",
    },
  });

  return form;
}
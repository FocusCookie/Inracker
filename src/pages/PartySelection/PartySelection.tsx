import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";

type Props = {};

function PartySelection({}: Props) {
  return (
    <div className="flex h-full w-full justify-center rounded-md bg-white p-2">
      <div className="flex max-w-xl flex-col gap-2">
        <TypographyH1>Party Selection</TypographyH1>

        <TypographyP>
          Select an existing Party or create a new one to start with.
        </TypographyP>

        <div className="flex w-full justify-center">
          <Button>Create a Pary</Button>
        </div>
      </div>
    </div>
  );
}

export default PartySelection;

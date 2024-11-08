import PartyCard from "@/components/PartyCard/PartyCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { Party } from "@/types/party";
import { useTranslation } from "react-i18next";

type Props = { parties: Party[]; renderCreatePartyDrawer: React.ReactElement };

function PartySelection({ parties, renderCreatePartyDrawer }: Props) {
  const { t } = useTranslation("PagePartySelection");

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 rounded-md bg-white p-2">
      <div className="flex max-w-xl flex-col gap-2">
        <TypographyH1>{t("headline")}</TypographyH1>

        <TypographyP>{t("description")}</TypographyP>

        <div className="flex w-full justify-center">
          {renderCreatePartyDrawer}
        </div>
      </div>

      <ScrollArea className="w-full max-w-xl pr-3">
        <div className="flex flex-col gap-4 pb-4">
          {parties.map((party) => (
            <PartyCard
              key={`party-${party.id}`}
              party={party}
              onEdit={() => {}}
              onOpen={() => {}}
              onPlayerClick={() => {}}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default PartySelection;

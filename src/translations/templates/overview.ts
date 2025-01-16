const de = `
<style>
  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  td {
    vertical-align: top;
    padding: 10px;
  }
</style>

<table>
<tr>
<td style="width:50%;">

## Allgemeine Informationen
- **Rasse:** Halbelf  
- **Ausrichtung:** Chaotisch Neutral  
- **Hintergrund:** Straßenkind  
- **Klassen-SG:** 18  
- **Bewegungsrate:** 8  

</td>
<td style="width:50%;">

## Verteidigung
- **AC (Rüstungsklasse):** 15  
- **Initiative:** +2  
- **Passive Wahrnehmung:** 13  
- **Reflex:** 18  
- **Willen:** 12  
- **Zähigkeit:** 20  

</td>
</tr>
<tr>
<td style="width:50%;">

## Rüstungsdetails
- **Rüstung:** 10  
- **Rüstungskompetenzen:**  
  - Ungerüstet: Geübt  
  - Leicht: Experte  
  - Mittelschwer: Experte  
  - Schwer: Meister  

</td>
<td style="width:50%;">

## Schild
- **Schildwert:** 12  
- **Härte:** 5  
- **Maximale HP:** 24  
- **Bewegungspenalty:** 10  

</td>
</tr>
</table>

## Attribute
| Attribut       | Modifikator |
|----------------|-------------|
| Stärke         | +1          |
| Geschicklichkeit| +2         |
| Konstitution   | +0          |
| Intelligenz    | +3          |
| Weisheit       | +1          |
| Charisma       | -1          |
`;
const en = `
<style>
  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  td {
    vertical-align: top;
    padding: 10px;
  }
</style>

<table>
<tr>
<td style="width:50%;">

## General Information
- **Race:** Half-Elf  
- **Alignment:** Chaotic Neutral  
- **Background:** Street Urchin  
- **Class DC:** 18  
- **Movement Speed:** 8  

</td>
<td style="width:50%;">

## Defense
- **AC (Armor Class):** 15  
- **Initiative:** +2  
- **Passive Perception:** 13  
- **Reflex:** 18  
- **Will:** 12  
- **Fortitude:** 20  

</td>
</tr>
<tr>
<td style="width:50%;">

## Armor Details
- **Armor:** 10  
- **Armor Proficiencies:**  
  - Unarmored: Trained  
  - Light: Expert  
  - Medium: Expert  
  - Heavy: Master  

</td>
<td style="width:50%;">

## Shield
- **Shield Value:** 12  
- **Hardness:** 5  
- **Max HP:** 24  
- **Speed Penalty:** 10  

</td>
</tr>
</table>

## Attributes
| Attribute     | Modifier |
|---------------|----------|
| Strength      | +1       |
| Dexterity     | +2       |
| Constitution  | +0       |
| Intelligence  | +3       |
| Wisdom        | +1       |
| Charisma      | -1       |
`;

export default { en, de };

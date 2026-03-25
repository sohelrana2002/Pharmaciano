// Parse medicine input like "napa 500mg" or "napa 500 mg"
export function parseMedicineInput(input: string) {
  input = input.trim();
  const match = input.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
  if (match) {
    const strength = match[1];
    const unit = match[2];
    const name = input.slice(0, match.index).trim();
    return { name, strength, unit };
  }
  return { name: input, strength: "", unit: "" };
}

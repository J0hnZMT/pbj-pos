type BulkTier = { minQuantity: number; pricePerPage: number };

export function calculatePrintCost(
  pages: number, 
  rawPaperCost: number, 
  inkCostFactor: number, 
  wastagePercentage: number, 
  bulkTiers: BulkTier[]
) {
  // 1. Calculate the true cost with the wastage factor
  // $$ \text{Total Cost} = (\text{Base Cost} \times \text{Pages}) \times (1 + \text{Wastage}) $$
  const baseCost = (rawPaperCost * pages) + inkCostFactor;
  const actualCost = baseCost * (1 + wastagePercentage);

  // 2. Determine the selling price based on bulk tiers
  // Sort tiers descending to find the highest applicable tier
  const sortedTiers = bulkTiers.sort((a, b) => b.minQuantity - a.minQuantity);
  
  let pricePerPage = sortedTiers[sortedTiers.length - 1].pricePerPage; // Default to lowest tier
  
  for (const tier of sortedTiers) {
    if (pages >= tier.minQuantity) {
      pricePerPage = tier.pricePerPage;
      break;
    }
  }

  const finalSellingPrice = pages * pricePerPage;
  const profit = finalSellingPrice - actualCost;

  return {
    actualCost,
    finalSellingPrice,
    profit
  };
}
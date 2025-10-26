export const scannedItems = [

];

// Add a function to add new items
export const addScannedItem = (item) => {
  // Prevent duplicates (based on barcode)
  const exists = scannedItems.find((i) => i.barcode === item.barcode);
  if (!exists) {
    scannedItems.push({
      ...item,
      scannedAt: new Date().toISOString(), // record the time
    });
  }
  console.log(scannedItems)
};

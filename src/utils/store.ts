export const extractFields = (data: any) => {
  const item = data[0];
  const keys = Object.keys(item).filter((key) => key !== "id" && key !== "x" && key !== "y");
  if (keys.length > 0) {
    return keys.map((key) => ({ label: key, value: true }));
  }
};

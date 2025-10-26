export const getAllFoods = (req, res) => {
  const dummyMenu = [
    { id: 1, name: "Masala Dosa", price: 8.5 },
    { id: 2, name: "Pav Bhaji", price: 7.0 },
    { id: 3, name: "Paneer Tikka", price: 10.0 },
  ];
  res.json(dummyMenu);
};
